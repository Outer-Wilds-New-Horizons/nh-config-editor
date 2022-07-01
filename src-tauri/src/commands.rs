use std::fs;

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
    let path = std::path::Path::new(&path);
    return (path.file_name().unwrap_or_default().to_str().unwrap().to_string(),
            path.extension().unwrap_or_default().to_str().unwrap().to_string());
}

#[tauri::command]
pub fn root_dir(path: String, root_path: String) -> String {
    let p_path = std::path::Path::new(&path);
    let p_root_path = std::path::Path::new(&root_path);
    let mut ancestors = p_path.strip_prefix(p_root_path).unwrap().ancestors();
    return ancestors.nth(ancestors.count() - 2).unwrap().to_str().unwrap().to_string();
}

#[tauri::command]
pub fn canonicalize(path: String) -> String {
    return std::path::Path::new(&path).canonicalize().unwrap().to_str().unwrap().to_string();
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
