#[tauri::command]
pub fn list_dir(path: String) -> Vec<String> {
    let mut result = Vec::new();
    for entry in std::fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        result.push(entry.path().display().to_string());
    }
    result
}

#[tauri::command]
pub fn is_dir(path: String) -> bool {
    std::fs::metadata(path).unwrap().is_dir()
}

#[tauri::command]
pub fn get_metadata(path: String) -> (String, String) {
    let path = std::path::Path::new(&path);
    (path.file_name().unwrap_or_default().to_str().unwrap().to_string(),
     path.extension().unwrap_or_default().to_str().unwrap().to_string())
}

#[tauri::command]
pub fn root_dir(path: String, root_path: String) -> String {
    let p_path = std::path::Path::new(&path);
    let p_root_path = std::path::Path::new(&root_path);
    let mut ancestors = p_path.strip_prefix(p_root_path).unwrap().ancestors();
    ancestors.nth(ancestors.count() - 2).unwrap().to_str().unwrap().to_string()
}
