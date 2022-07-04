use std::fs::{File, read_to_string};
use std::io::prelude::*;
use std::io::Write;
use std::iter::Iterator;
use std::path::Path;

use minify::json::minify;
use walkdir::WalkDir;
use zip::write::FileOptions;

fn filter_files(entry: &walkdir::DirEntry, root_path: &Path) -> bool {
    let path = entry.path();
    let file_name = path.file_name().unwrap().to_str().unwrap();
    let extension = path.extension().unwrap_or_default().to_str().unwrap();
    let mut ancestors = path.strip_prefix(root_path).unwrap().ancestors();
    let top_dir = if ancestors.count() > 2 { ancestors.nth(ancestors.count() - 2).unwrap().to_str().unwrap() } else { "" };

    return !(
        file_name.starts_with(".") ||
            file_name.eq("config.json") ||
            file_name.eq("build") ||
            top_dir.eq("build") ||
            extension.eq("md"));
}

pub fn zip_dir(raw_path: &str, zip_name: &str, minify_json: bool)
{
    let path = Path::new(raw_path);
    let mut zip = zip::ZipWriter::new(File::create(zip_name).unwrap());

    let options = FileOptions::default().compression_method(zip::CompressionMethod::Stored);
    let walker = WalkDir::new(path);

    let mut buffer = Vec::new();

    for entry in walker.into_iter().filter_map(|e| e.ok()).filter(|e| filter_files(e, path)) {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(raw_path)).unwrap();

        if path.is_file() {
            zip.start_file(name.to_str().unwrap(), options).unwrap();

            if minify_json && path.extension().unwrap_or_default().to_str().unwrap().eq("json") {
                let json = minify(&read_to_string(path).expect("Error Reading JSON"));
                buffer.extend(json.as_bytes());
                zip.write_all(&*buffer).unwrap();
            } else {
                let mut file = File::open(path).unwrap();
                file.read_to_end(&mut buffer).unwrap();
                zip.write_all(&*buffer).unwrap();
            }

            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            zip.add_directory(name.to_str().unwrap(), options).unwrap();
        }
    }

    zip.finish().unwrap();
}

