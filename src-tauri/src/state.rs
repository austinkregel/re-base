use std::{collections::HashMap, io::Write};
use std::fs;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tauri::{async_runtime::Mutex as AsyncMutex};
use std::path::Path;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Node {
    pub id: String,
    pub name: String,
    pub local_ip: String,
    pub txt: HashMap<String, String>,
}

pub trait INode {
    fn new() -> Self;
    fn add_txt(&mut self, key: &str, value: &str);
    fn get_txt(&self, key: &str) -> Option<&String>;
}
impl INode for Node {
    fn new() -> Node {
        Node {
            id: Uuid::new_v4().to_string(),
            name: "Node".to_string(),
            local_ip: "".to_string(),
            txt: HashMap::new(),
        }
    }

    fn add_txt(&mut self, key: &str, value: &str) {
        self.txt.insert(key.to_string(), value.to_string());
    }
    fn get_txt(&self, key: &str) -> Option<&String> {
        self.txt.get(key)
    }
}


pub(crate) struct ClientState {
    nodes: Arc<AsyncMutex<HashMap<String, Node>>>,
    host: Arc<AsyncMutex<String>>,
}


impl ClientState {
    

    pub fn new(host: String) -> ClientState {
        ClientState {
            nodes: Arc::new(AsyncMutex::new(HashMap::new())),
            host: Arc::new(AsyncMutex::new(host)),
        }
    }
    pub(crate) async fn add_node(&self, node: Node) -> Result<(), String> {
        if self.nodes.lock().await.contains_key(&node.id) {
            return Ok(());
        }

        self.nodes.lock().await.insert(node.id.clone(), node).unwrap();
        Ok(())
    }

    pub(crate) async fn node_exists(&self, id: &str) -> bool {
        let nodes = self.nodes.lock().await;
        // We want to check the id of each node in the HashMap
        for node in nodes.values() {
            if node.id == id {
                return true
            }
        }

        return false
    }

    pub(crate) async fn get_node(&self, id: &str) -> Result<Node, String> {
        let nodes = self.nodes.lock().await;
        match nodes.get(id) {
            Some(node) => Ok(node.clone()),
            None => Err(format!("Node with id {} not found", id)),
        }
    }

    pub(crate) async fn get_nodes(&self) -> Result<Vec<Node>, String> {
        let nodes = self.nodes.lock().await;
        Ok(Vec::from_iter(nodes.values().cloned()))
    }

    pub(crate) async fn update_node(&self, node: Node) -> Result<(), String> {
        let mut nodes = self.nodes.lock().await;
        match nodes.get_mut(&node.id) {
            Some(n) => {
                *n = node;
                Ok(())
            }
            None => Err(format!("Node with id {} not found", node.id)),
        }
    }

    pub(crate) async fn delete_node(&self, id: &str) -> Result<(), String> {
        let mut nodes = self.nodes.lock().await;
        match nodes.remove(id) {
            Some(_) => Ok(()),
            None => Err(format!("Node with id {} not found", id)),
        }
    }

    pub(crate) fn generate_node(&self, name: &str, ip: &str, txt: HashMap<String, String>) -> Node {
        Node {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            local_ip: ip.to_string(),
            txt,
        }
    }

    pub(crate) async fn save_to_file(&self, path: &str) -> Result<(), String> {
        let nodes = self.nodes.lock().await;
        let json = serde_json::to_string(&*nodes).map_err(|e| e.to_string())?;

        if !Path::new(path).exists() {
            fs::OpenOptions::new()
                .create_new(true)
                .write(true)
                .append(true)
                .open(path)
                .unwrap()
                .write("".as_bytes())
                .unwrap();
        }


        fs::write(path, json).map_err(|e| e.to_string())?;
        println!("Updated");
        Ok(())
    }

    pub(crate) async fn load_from_file(&self, path: &str) -> Result<(), String> {
        if !Path::new(path).exists() {
            println!("File contained no data");
            fs::OpenOptions::new()
                .create_new(true)
                .write(true)
                .append(true)
                .open(path)
                .unwrap()
                .write("{}".as_bytes())
                .unwrap();
        }
        let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
        println!("Loading from file");
        let imported_nodes: HashMap<String, Node> = serde_json::from_str(&json).map_err(|e| e.to_string())?;

        let mut nodes = self.nodes.lock().await;
        *nodes = imported_nodes;
        Ok(())
    }
}