#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod commands;
mod menus;
mod build_project;

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::list_dir,
            commands::is_dir,
            commands::get_metadata,
            commands::root_dir,
            commands::load_image_as_base_64,
            commands::read_file_as_string,
            commands::write_string_to_file,
            commands::file_exists,
            commands::canonicalize,
            commands::show_in_explorer,
            commands::get_env,
            commands::zip_project])
        .menu(menus::make_main_menu())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        })
        .run(context)
        .expect("error while running tauri application");
}
