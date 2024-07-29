// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_utils;
mod auth;

use std::{collections::HashMap, fs::File, io::Seek };
use auth::Auth;

use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize, PtySystem};
use std::{
    io::{BufRead, BufReader, Read, Write},
    process::exit,
    sync::Arc,
    thread::{self},
    fs
};
use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};
use tauri::{async_runtime::Mutex as AsyncMutex, State};

#[derive(Serialize, Deserialize)]
struct PluginManifest {
    name: String,
    version: String,
    entry_point: String,
}

struct AppState {
    pty_pair: Arc<AsyncMutex<PtyPair>>,
    writer: Arc<AsyncMutex<Box<dyn Write + Send>>>,
    reader: Arc<AsyncMutex<BufReader<Box<dyn Read + Send>>>>,

    authenticated: Arc<AsyncMutex<HashMap<String, String>>>,
    servers: Arc<AsyncMutex<HashMap<String, Client>>>,

    host: Arc<AsyncMutex<String>>,
}

fn get_hostname() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("hostname").output().ok()?;
        Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }

    #[cfg(not(target_os = "windows"))]
    {
        use std::process::Command;
        let output = Command::new("hostname").output().ok()?;
        Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }
}
#[tauri::command]
// create a shell and add to it the $TERM env variable so we can use clear and other commands
async fn async_create_shell(_state: State<'_, AppState>) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let mut cmd = CommandBuilder::new("powershell.exe");

    #[cfg(not(target_os = "windows"))]
    let mut cmd = CommandBuilder::new("bash");

    // add the $TERM env variable so we can use clear and other commands

    #[cfg(target_os = "windows")]
    cmd.env("TERM", "cygwin");

    #[cfg(not(target_os = "windows"))]
    cmd.env("TERM", "xterm-256color");

    let mut child = _state
        .pty_pair
        .lock()
        .await
        .slave
        .spawn_command(cmd)
        .map_err(|err| err.to_string())?;

    thread::spawn(move || {
        let status = child.wait().unwrap();
        exit(status.exit_code() as i32)
    });
    Ok(())
}

#[tauri::command]
async fn async_write_to_pty(data: &str, _state: State<'_, AppState>) -> Result<(), ()> {
    write!(_state.writer.lock().await, "{}", data).map_err(|_| ())
}

#[tauri::command]
async fn async_read_from_pty(_state: State<'_, AppState>) -> Result<Option<String>, ()> {
    let mut reader = _state.reader.lock().await;
    let data = {
        // Read all available text
        let data = reader.fill_buf().map_err(|_| ())?;

        // Send te data to the webview if necessary
        if data.len() > 0 {
            std::str::from_utf8(data)
                .map(|v| Some(v.to_string()))
                .map_err(|_| ())?
        } else {
            None
        }
    };

    if let Some(data) = &data {
        reader.consume(data.len());
    }

    Ok(data)
}

#[tauri::command]
async fn async_resize_pty(rows: u16, cols: u16, _state: State<'_, AppState>) -> Result<(), ()> {
    _state
        .pty_pair
        .lock()
        .await
        .master
        .resize(PtySize {
            rows,
            cols,
            ..Default::default()
        })
        .map_err(|_| ())
}

// the payload type must implement `Serialize` and `Clone`.
#[derive(serde::Serialize)]
struct Payload {
    name: String,
    client_id: String,
}

#[derive(serde::Serialize, Clone)]
struct TxtRecords {
    name: String,
    path: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
struct Client {
    id: String,
    name: String,
    ip: String,
    txt: HashMap<String, String>,
}

#[derive(serde::Serialize)]
struct Response {
    hostname: String,
    servers: Vec<Client>,
    token: Option<String> ,
}
// clients on the rust side, refers to all the hosts; not browsers.
#[tauri::command]
async fn initialize(state: State<'_, AppState>, name: String, client_id: String, token: String) -> Result<Response, String> {
    println!("Got initialize request from interface, {}, {}", name, client_id);
    let hostname = get_hostname().unwrap_or_else(|| "unknown".to_string());
    
    let client = Client {
        id: client_id.clone(),
        name: hostname.clone(),
        ip: local_ip().unwrap().to_string(),
        txt: HashMap::new(),
    };
    if state.servers.lock().await.contains_key(&client.id) {
        return Ok(Response {
            hostname,
            servers: state.servers.lock().await.values().cloned().collect(),
            token: None
        })
    }

    state.servers.lock().await.insert(client.id.clone(), client.clone());

  // println!("Message: {}", payload.message);
    Ok(Response {
        hostname,
        servers: state.servers.lock().await.values().cloned().collect(),
        token: None
    })
}

// When the client disconnects, we remove it from the list of clients
#[tauri::command]
async fn deinitialize(_state: State<'_, AppState>, client_id: String) -> Result<(), String> {
    println!("Got disconnect request from interface, {}", client_id);
    _state.servers.lock().await.remove(&client_id);
    Ok(())
}


#[derive(Serialize, Deserialize)]
struct FileEntry {
    name: String,
    is_directory: bool,
    absolute: String,
    path: String,
}

#[tauri::command]
async fn async_read_file(path: String, _state: State<'_, AppState>) -> Result<String, String> {
    let mut file = match File::open(&path) {
        Ok(file) => file,
        Err(e) => return Err(format!("Failed to open file: {}", e)),
    };

    let mut contents = String::new();
    match file.read_to_string(&mut contents) {
        Ok(_) => Ok(contents),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}
#[tauri::command]
async fn login(state: State<'_, AppState>, email: String, password: String) -> Result<Response, HashMap<String, String>> {
    let auth = Auth::new();
    // We store our usernames and passwords in a file, but it won't exist on first boot
    let path = "users.json";
    let users: HashMap<String, String> = match file_utils::read_file(path) {
        Ok(users) => serde_json::from_str(&users).unwrap_or_else(|_| HashMap::new()),
        Err(_) => {
            let mut users = HashMap::new();

            // TODO: Change how this is created....
            users.insert("admin@admin.com".to_string(), auth.hash_password("password"));

            let encoded_users: String = serde_json::to_string(&users).unwrap();
            file_utils::update_file(path, &encoded_users).unwrap();
            users
        }
    };
    let mut errors = HashMap::new();

    // Check if the user exists
    if !users.contains_key(&email) {
        println!("Email not found {}", email);
        errors.insert("email".to_string(), "Email not found".to_string());
        return Err(errors);
    }

    // Check if the password is correct
    let correct_password = users.get(&email).unwrap();
    if !auth.verify_password(&password, correct_password) {
        errors.insert("password".to_string(), "Incorrect password".to_string());
        return Err(errors);
    }

    // Generate a token, using base64 encoded random bytes
    let token = base64::encode(&rand::random::<[u8; 32]>());

    state.authenticated.lock().await.insert(token.clone(), email.clone());

    Ok(Response {
        hostname: "hostname".to_string(),
        servers: state.servers.lock().await.values().cloned().collect(),
        token: Some(token.to_string())
    })
}

#[tauri::command]
async fn logout(state: State<'_, AppState>, token: String) -> Result<Response, String> {
    if state.authenticated.lock().await.remove(&token).is_none() {
        return Err("Invalid token".to_string());
    }

    Ok(Response {
        hostname: "hostname".to_string(),
        servers: state.servers.lock().await.values().cloned().collect(),
        token: None
    })
}

#[tauri::command]
async fn async_fetch_path(path: String) -> Result<String, String> {
    // We want to scan the directory for folders and files
    let paths = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    let mut directories = Vec::new();
    for path in paths {
        let path = path.map_err(|e| e.to_string())?.path();
        let name = path.file_name().ok_or("Failed to get file name")?.to_str().ok_or("Failed to convert file name to string")?.to_string();
        let is_directory = path.is_dir();

        let absolute_path = path.to_str().ok_or("Failed to convert path to string")?;
        let md5_hasher = md5::compute(absolute_path);
        let absolute = format!("{:x}", md5_hasher);
        let path = path.to_str().ok_or("Failed to convert path to string")?.to_string();

        if is_directory {
            directories.push(FileEntry { name, is_directory, absolute, path });
         } else {
            files.push(FileEntry { name, is_directory, absolute, path });
         }
    }
    // Sort the directories and files
    directories.sort_by(|a, b| a.name.cmp(&b.name));
    files.sort_by(|a, b| a.name.cmp(&b.name));

    // Merge directories and files
    directories.append(&mut files);

    let manifest = serde_json::to_string(&directories).unwrap();
    Ok(manifest)
}

#[tauri::command]
async fn upsert_clients(_state: State<'_, AppState>, clients: Vec<Client>) -> Result<(), String> {
    for client in clients {
        _state.servers.lock().await.insert(client.id.clone(), client.clone());
        // println json serialize the client
        println!("Client: {:?}", client);
    }
    //write the server list to a file
    let path = "servers.json";
    let clients = _state.servers.lock().await.clone();
    let encoded_servers: String = serde_json::to_string(&clients).unwrap();
    file_utils::update_file(path, &encoded_servers).unwrap();

    Ok(())
}

#[tauri::command]
async fn async_write_file(path: String, contents: String, md5: String) -> Result<(), String> {
    // get md5 of the contents, and print it to the console.
    let md5_hasher = md5::compute(&contents);
    let our_md5 = format!("{:x}", md5_hasher);
    println!("Requested change to file: {}. Updated: {}, ourhash: {}", path, md5, our_md5);

    if md5 != our_md5 {
        println!("MD5 hash does not match when attempting to update file: {}. This likely means we didn't get the full contents", path);
        return Err("MD5 hash does not match".to_string());
    }

    // if it does, open it
    let mut file: File = File::open(&path).unwrap();
    // get the contents of the file, so we can try to md5 the contents
    let mut file_contents: String = String::new();
    match file.read_to_string(&mut file_contents) {
        Ok(_) => (),
        Err(e) => return Err(format!("Failed to read file: {}", e)),
    }

    // get the md5 of the file contents
    let actualMd5 = format!("{:x}", md5::compute(&file_contents));

    println!("Found Actual MD5: {}, updated: {}", actualMd5, our_md5);

    if actualMd5 == our_md5 {
        println!("MD5 hash matches, not writing to file to save writes: {}", path);

        return Ok(());
    }

    println!("Writing to file: {}, {} bytes", path.to_string(), contents.len());

    file = File::create(&path).unwrap();

    match file.write_all(contents.as_bytes()) {
        Ok(_) => Ok(()),
        Err(e) => {
            println!("Failed to write to file: {}", e);
            Err(format!("Failed to write to file: {}", e))
        }
    }
}

fn main() {
    let pty_system: Box<dyn PtySystem + Send> = native_pty_system();

    let pty_pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .unwrap();

    let reader = pty_pair.master.try_clone_reader().unwrap();
    let writer = pty_pair.master.take_writer().unwrap();

    tauri::Builder::default()
        .manage(AppState {
            pty_pair: Arc::new(AsyncMutex::new(pty_pair)),
            writer: Arc::new(AsyncMutex::new(writer)),
            reader: Arc::new(AsyncMutex::new(BufReader::new(reader))),
            servers: Arc::new(AsyncMutex::new(HashMap::new())),
            authenticated: Arc::new(AsyncMutex::new(HashMap::new())),
            
            host: Arc::new(AsyncMutex::new("".to_string())),
        })

        .invoke_handler(tauri::generate_handler![
            async_write_to_pty,
            async_resize_pty,
            async_create_shell,
            async_read_from_pty,
            
            async_read_file,
            async_fetch_path,
            async_write_file,
        
            initialize,
            deinitialize,
            login,
            logout,
            upsert_clients,
        ])
        .run(tauri::generate_context!())
        // Once we're running, add the client to the list of servers
        .expect("error while running tauri application");
}



