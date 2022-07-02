use tauri::{CustomMenuItem, Menu, Submenu};

fn make_new_file_submenu() -> Submenu {
    let new_planet = CustomMenuItem::new("new_planet", "New Planet");
    let new_system = CustomMenuItem::new("new_system", "New System");
    let new_translation = CustomMenuItem::new("new_translation", "New Translation");
    let make_manifest = CustomMenuItem::new("create_addon_manifest", "Create Addon Manifest");

    let file_new_menu = Submenu::new("New", Menu::new()
        .add_item(new_planet)
        .add_item(new_system)
        .add_item(new_translation)
        .add_item(make_manifest),
    );

    return file_new_menu;
}

fn make_file_submenu() -> Submenu {
    let new_file_menu = make_new_file_submenu();

    let save_file = CustomMenuItem::new("save", "Save");
    let save_all_files = CustomMenuItem::new("save_all", "Save All");

    let close_file = CustomMenuItem::new("close", "Close");
    let close_project = CustomMenuItem::new("close_project", "Close Project");

    let reload_project = CustomMenuItem::new("reload_project", "Reload Project");

    let quit = CustomMenuItem::new("quit", "Quit");

    let file_menu = Submenu::new("File", Menu::new()
        .add_submenu(new_file_menu)
        .add_item(save_file)
        .add_item(save_all_files)
        .add_item(close_file)
        .add_item(close_project)
        .add_item(reload_project)
        .add_item(quit),
    );

    return file_menu;
}

fn make_project_submenu() -> Submenu {
    let open_explorer = CustomMenuItem::new("open_explorer", "Open In Explorer");
    let build_project = CustomMenuItem::new("build_project", "Build Project");
    let settings = CustomMenuItem::new("project_settings", "Project Settings");
    let analyze = CustomMenuItem::new("analyze", "Analyze");

    let project_menu = Submenu::new("Project", Menu::new()
        .add_item(open_explorer)
        .add_item(build_project)
        .add_item(settings)
        .add_item(analyze),
    );

    return project_menu;
}

fn make_about_submenu() -> Submenu {
    let info = CustomMenuItem::new("show_info", "Show Info");
    let online_help = CustomMenuItem::new("help", "Online Help");
    let check_for_updates = CustomMenuItem::new("check_for_updates", "Check for Updates");

    let about_menu = Submenu::new("About", Menu::new()
        .add_item(info)
        .add_item(online_help)
        .add_item(check_for_updates),
    );

    return about_menu;
}

pub fn make_main_menu() -> Menu {
    let file_menu = make_file_submenu();
    let project_menu = make_project_submenu();
    let about_menu = make_about_submenu();

    let main_menu = Menu::new()
        .add_submenu(file_menu)
        .add_submenu(project_menu)
        .add_submenu(about_menu);

    return main_menu;
}