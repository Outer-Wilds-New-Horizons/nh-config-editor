extern crate fs_extra;

use std::fs;
use std::fs::create_dir;
use std::path::Path;
use std::process::Command;
use fs_extra::dir;
use walkdir::WalkDir;
use serde::{Serialize, Deserialize};

use super::build_project;

#[tauri::command]
pub fn zip_project(path: String, output_zip_name: String, minify: bool) {
    let project_path = Path::new(&path);
    let build_path = project_path.join("build");
    let output_path = build_path.join(Path::new(&output_zip_name));

    if !build_path.exists() {
        create_dir(build_path).unwrap();
    }

    build_project::zip_dir(project_path.to_str().unwrap(), output_path.to_str().unwrap(), minify);
}

#[tauri::command]
pub fn list_dir(path: String) -> Result<Vec<String>, String> {
    let file_list = fs::read_dir(path);
    return if file_list.is_err() {
        Err(format!("{}", file_list.unwrap_err()))
    } else {
        let mut result = Vec::new();
        for entry in file_list.unwrap() {
            result.push(entry.unwrap().path().display().to_string());
        }
        Ok(result)
    }
}

#[tauri::command]
pub fn is_dir(path: String) -> Result<bool, String> {
    let metadata = fs::metadata(path);
    return if metadata.is_err() {
        Err(format!("{}", metadata.unwrap_err()))
    } else {
        Ok(metadata.unwrap().is_dir())
    };
}

#[tauri::command]
pub fn get_metadata(path: String) -> (String, String) {
    let path = Path::new(&path);
    return (path.file_name().unwrap_or_default().to_str().unwrap().to_string(),
            path.extension().unwrap_or_default().to_str().unwrap().to_string());
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFile {
    name: String,
    relative_path: String,
    absolute_path: String,
    extension: String,
    is_folder: bool
}

#[tauri::command]
pub fn walk_project(path: String) -> Result<Vec<ProjectFile>, String> {
    let mut result = Vec::new();
    for entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()).filter(|e| e.path().to_str().unwrap_or_default() != path) {
        let name = entry.file_name().to_str().unwrap().to_string();
        let file_path = entry.path();
        let relative_path = file_path.strip_prefix(&path).unwrap().to_str().unwrap().to_string();
        let absolute_path = file_path.to_str().unwrap().to_string();
        let extension = entry.path().extension().unwrap_or_default().to_str().unwrap().to_string();
        let is_folder = entry.path().is_dir();
        result.push(ProjectFile {
            name,
            relative_path,
            absolute_path,
            extension,
            is_folder
        });
    }
    return Ok(result);
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    return fs::metadata(path).is_ok();
}

#[tauri::command]
pub fn load_file_as_base_64(path: String) -> Result<String, String> {
    let bytes = fs::read(path);
    return if bytes.is_err() {
        Err(format!("{}", bytes.unwrap_err()))
    } else {
        let base64_data = base64::encode(&bytes.unwrap());
        Ok(base64_data)
    };
}

#[tauri::command]
pub fn read_file_as_string(path: String) -> Result<String, String> {
    let result = fs::read_to_string(path);
    return if result.is_err() {
        Err(format!("{}", result.unwrap_err()))
    } else {
        Ok(result.unwrap())
    };
}

#[tauri::command]
pub fn write_string_to_file(path: String, content: String) -> Result<(), String> {
    let result = fs::write(path, content);
    return if result.is_err() {
        Err(format!("{}", result.unwrap_err()))
    } else {
        Ok(())
    };
}

#[tauri::command]
pub fn copy_file(src: String, dest: String) -> Result<(), String> {
    fs::create_dir_all(Path::new(&dest).parent().unwrap()).unwrap();
    let result = fs::copy(src, dest);
    return if result.is_err() {
        Err(format!("{}", result.unwrap_err()))
    } else {
        Ok(())
    };
}

#[tauri::command]
pub fn copy_dir(src: String, dest: String) -> Result<(), String> {
    fs::create_dir_all(Path::new(&dest).parent().unwrap()).unwrap();
    let options = dir::CopyOptions {
        overwrite: true,
        skip_exist: false,
        copy_inside: true,
        ..Default::default()
    };
    let result = dir::copy(Path::new(&src), Path::new(&dest), &options);
    return if result.is_err() {
        Err(format!("{}", result.unwrap_err()))
    } else {
        Ok(())
    };
}

#[tauri::command]
pub fn mk_dir(path: String) {
    fs::create_dir_all(path).expect("Couldn't Create Directory");
}

#[tauri::command]
pub fn delete_dir(path: String) {
    fs::remove_dir_all(path).expect("Couldn't Delete Directory");
}

#[tauri::command]
pub fn delete_file(path: String) {
    fs::remove_file(path).expect("Couldn't Delete File");
}

#[tauri::command]
pub fn run_game(owml_path: String, port: i32) -> Result<(), String> {
    let owml_path = Path::new(&owml_path);
    let result = Command::new(owml_path.join("OWML.Launcher.exe").to_str().unwrap_or_default())
        .arg("-consolePort")
        .arg(port.to_string())
        .current_dir(owml_path)
        .spawn();
    return if result.is_err() {
        Err(format!("{}", result.unwrap_err()))
    } else {
        Ok(())
    }
}