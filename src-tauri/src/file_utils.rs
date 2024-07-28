use std::fs;
use std::io::{self, Read, Write};
use std::path::Path;

pub(crate) fn list_files_and_folders(directory: &str) -> io::Result<()> {
    let entries = fs::read_dir(directory)?;

    for entry in entries {
        let entry = entry?;
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_string_lossy();

        if path.is_dir() {
            println!("Directory: {}", file_name);
        } else {
            println!("File: {}", file_name);
        }
    }

    Ok(())
}

pub(crate) fn read_file(file_path: &str) -> io::Result<String> {
    let mut file = fs::File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    Ok(contents)
}

pub(crate) fn update_file(file_path: &str, new_content: &str) -> io::Result<()> {
    fs::write(file_path, new_content)?;

    Ok(())
}

pub(crate) fn delete_file_or_folder(path: &str) -> io::Result<()> {
    let path = Path::new(path);

    if path.is_dir() {
        fs::remove_dir_all(path)?;
    } else {
        fs::remove_file(path)?;
    }

    Ok(())
}