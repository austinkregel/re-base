// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_utils;

use std::{collections::HashMap, fs::File};

use data_encoding::Specification;
use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use std::{
    io::{BufRead, BufReader, Read, Write},
    process::exit,
    sync::Arc,
    thread::{self},
    fs
};
use md5::compute;
use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};
use tauri::{async_runtime::Mutex as AsyncMutex, State};
use file_utils::{
    list_files_and_folders,
    read_file,
    update_file,
    delete_file_or_folder,
};

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

    clients: Arc<AsyncMutex<HashMap<String, Client>>>,

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
async fn async_create_shell(state: State<'_, AppState>) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let mut cmd = CommandBuilder::new("powershell.exe");

    #[cfg(not(target_os = "windows"))]
    let mut cmd = CommandBuilder::new("bash");

    // add the $TERM env variable so we can use clear and other commands

    #[cfg(target_os = "windows")]
    cmd.env("TERM", "cygwin");

    #[cfg(not(target_os = "windows"))]
    cmd.env("TERM", "xterm-256color");

    let mut child = state
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
async fn async_write_to_pty(data: &str, state: State<'_, AppState>) -> Result<(), ()> {
    write!(state.writer.lock().await, "{}", data).map_err(|_| ())
}

#[tauri::command]
async fn async_read_from_pty(state: State<'_, AppState>) -> Result<Option<String>, ()> {
    let mut reader = state.reader.lock().await;
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
async fn async_resize_pty(rows: u16, cols: u16, state: State<'_, AppState>) -> Result<(), ()> {
    state
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

#[derive(serde::Serialize, Clone)]
struct Client {
    id: String,
    name: String,
    ip: String,
    txt: HashMap<String, String>,
}

#[derive(serde::Serialize)]
struct Response {
    hostname: String,
    clients: Vec<Client>,
}
// clients on the rust side, refers to all the hosts; not browsers.
#[tauri::command]
async fn initialize(state: State<'_, AppState>, name: String) -> Result<Response, String> {
    println!("Got initialize request from interface, {}", name);
    let hostname = get_hostname().unwrap_or_else(|| "unknown".to_string());
    let ip = local_ip().unwrap();

    let client = Client {
        id: ip.to_string().clone(),
        name: hostname.clone(),
        ip: ip.to_string().clone(),
        txt: HashMap::new(),
    };

    state.clients.lock().await.insert(ip.to_string().clone(), client);
  // println!("Message: {}", payload.message);
    Ok(Response {
        hostname,
        clients: state.clients.lock().await.values().cloned().collect(),
    })
}

// When the client disconnects, we remove it from the list of clients
#[tauri::command]
async fn deinitialize(state: State<'_, AppState>, client_id: String) -> Result<(), String> {
    println!("Got disconnect request from interface, {}", client_id);
    state.clients.lock().await.remove(&client_id);
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
async fn async_fetch_path(path: String) -> Result<String, String> {
    // We want to scan the directory for folders and files
    let paths = fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut manifest = Vec::new();
    for path in paths {
        let path = path.map_err(|e| e.to_string())?.path();
        let name = path.file_name().ok_or("Failed to get file name")?.to_str().ok_or("Failed to convert file name to string")?.to_string();
        let is_directory = path.is_dir();

        let absolute_path = path.to_str().ok_or("Failed to convert path to string")?;
        let md5_hasher = compute(absolute_path);
        let absolute = format!("{:x}", md5_hasher);
        let path = path.to_str().ok_or("Failed to convert path to string")?.to_string();
        manifest.push(FileEntry { name, is_directory, absolute, path });
    }
    let manifest = serde_json::to_string(&manifest).unwrap();
    Ok(manifest)
}

fn main() {
    let pty_system = native_pty_system();

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
            clients: Arc::new(AsyncMutex::new(HashMap::new())),
            
            host: Arc::new(AsyncMutex::new("".to_string())),
        })

        .invoke_handler(tauri::generate_handler![
            async_write_to_pty,
            async_resize_pty,
            async_create_shell,
            async_read_from_pty,
            
            async_read_file,
            async_fetch_path,
        
            initialize,
            deinitialize
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



