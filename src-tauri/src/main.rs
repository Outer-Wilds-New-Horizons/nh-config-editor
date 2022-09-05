#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod commands;
// mod menus;
mod build_project;

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::list_dir,
            commands::is_dir,
            commands::get_metadata,
            commands::walk_project,
            commands::load_file_as_base_64,
            commands::read_file_as_string,
            commands::write_string_to_file,
            commands::file_exists,
            commands::zip_project,
            commands::copy_file,
            commands::copy_dir,
            commands::mk_dir,
            commands::delete_dir,
            commands::delete_file,
            commands::run_game,])
        .run(context)
        .expect("error while running tauri application");
}
