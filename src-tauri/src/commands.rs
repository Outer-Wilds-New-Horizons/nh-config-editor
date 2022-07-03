use std::fs;
use std::fs::create_dir;
use std::path::Path;

use super::build_project;

#[tauri::command]
pub fn get_env(key: String) -> String {
    let env_var = std::env::var(key).unwrap_or("0".to_string());
    return env_var;
}

#[tauri::command]
pub fn zip_project(path: String, output_zip_name: String) {
    let project_path = Path::new(&path);
    let build_path = project_path.join("build");
    let output_path = build_path.join(Path::new(&output_zip_name));

    if !build_path.exists() {
        create_dir(build_path).unwrap();
    }

    build_project::zip_dir(project_path.to_str().unwrap(), output_path.to_str().unwrap());
}

#[tauri::command]
pub fn list_dir(path: String) -> Vec<String> {
    let mut result = Vec::new();
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        result.push(entry.path().display().to_string());
    }
    return result;
}

#[tauri::command]
pub fn is_dir(path: String) -> bool {
    return fs::metadata(path).unwrap().is_dir();
}

#[tauri::command]
pub fn get_metadata(path: String) -> (String, String) {
    let path = Path::new(&path);
    return (path.file_name().unwrap_or_default().to_str().unwrap().to_string(),
            path.extension().unwrap_or_default().to_str().unwrap().to_string());
}

#[tauri::command]
pub fn root_dir(path: String, root_path: String) -> String {
    let p_path = Path::new(&path);
    let p_root_path = Path::new(&root_path);
    let mut ancestors = p_path.strip_prefix(p_root_path).unwrap().ancestors();
    return ancestors.nth(ancestors.count() - 2).unwrap().to_str().unwrap().to_string();
}

#[tauri::command]
pub fn canonicalize(path: String) -> String {
    return Path::new(&path).canonicalize().unwrap().to_str().unwrap().to_string();
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    return fs::metadata(path).is_ok();
}

#[tauri::command]
pub fn load_image_as_base_64(img_path: String) -> String {
    let img_bytes = fs::read(img_path).expect("Couldn't Read Image");
    base64::encode_config(img_bytes, base64::STANDARD)
}

#[tauri::command]
pub fn read_file_as_string(path: String) -> String {
    fs::read_to_string(path).expect("Couldn't Read File")
}

#[tauri::command]
pub fn write_string_to_file(path: String, content: String) {
    fs::write(path, content).expect("Couldn't Write File");
}

#[cfg(target_os = "windows")]
fn open_in_explorer(path: String) {
    std::process::Command::new("explorer").arg(path).spawn().unwrap();
}

#[cfg(target_os = "linux")]
fn open_in_explorer(path: String) {
    std::process::Command::new("xdg-open").arg(path).spawn().unwrap();
}

#[cfg(target_os = "macos")]
fn open_in_explorer(path: String) {
    std::process::Command::new("open").arg(path).spawn().unwrap();
}

#[tauri::command]
pub fn show_in_explorer(path: String) {
    open_in_explorer(path);
}

#[tauri::command]
pub fn copy_file(src: String, dest: String) {
    fs::create_dir_all(Path::new(&dest).parent().unwrap()).unwrap();
    fs::copy(src, dest).expect("Couldn't Copy File");
}

#[tauri::command]
pub fn mk_dir(path: String) {
    fs::create_dir_all(path).expect("Couldn't Create Directory");
}
