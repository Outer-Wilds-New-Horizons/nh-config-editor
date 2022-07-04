import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import CenteredSpinner from "../../../Common/Spinner/CenteredSpinner";
import { CommonProps } from "../../MainWindow";
import { ProjectFile, ProjectFileType } from "./ProjectFile";
import ProjectItem from "./ProjectItem";

async function recursiveBuild(path: string, props: CommonProps): Promise<ProjectFile> {
    const isDir: boolean = await invoke("is_dir", { path });

    const childPaths: string[] = isDir ? await invoke("list_dir", { path }) : [];

    const [fileName, extension] = await invoke("get_metadata", { path });

    const rootDir: string | null = isDir
        ? null
        : await invoke("root_dir", { path, rootPath: props.project.path });

    let fileType: ProjectFileType = "other";

    const children: ProjectFile[] = [];

    if (isDir) {
        for (const childPath of childPaths) {
            children.push(await recursiveBuild(childPath, props));
        }
    } else {
        if (rootDir === "planets" && extension === "json") {
            fileType = "planet";
        } else if (rootDir === "systems" && extension === "json") {
            fileType = "system";
        } else if (rootDir === "translations" && extension === "json") {
            fileType = "translation";
        } else if (fileName === "addon-manifest.json") {
            fileType = "addon_manifest";
        } else if (fileName === "manifest.json") {
            fileType = "mod_manifest";
        } else if (extension === "" || extension === "bundle" || extension === "assetbundle") {
            fileType = "asset_bundle";
        } else if (extension === "xml") {
            fileType = "xml";
        } else if (extension === "png" || extension === "jpg" || extension === "jpeg") {
            fileType = "image";
        } else if (extension === "mp3" || extension === "wav") {
            fileType = "sound";
        } else if (extension === "dll") {
            fileType = "binary";
        }
    }

    if (props.currentlyRegisteredFiles[path]) {
        props.currentlyRegisteredFiles[path].isFolder = isDir;
        props.currentlyRegisteredFiles[path].children = children;
        props.currentlyRegisteredFiles[path].name = fileName;
        props.currentlyRegisteredFiles[path].fileType = fileType;
    } else {
        props.currentlyRegisteredFiles[path] = new ProjectFile(
            isDir,
            children,
            fileName,
            path,
            fileType
        );
    }

    return props.currentlyRegisteredFiles[path];
}

async function buildProjectFiles(props: CommonProps): Promise<ProjectFile[]> {
    const rootFilePaths: string[] = await invoke("list_dir", {
        path: props.project.path
    });
    const rootFiles: ProjectFile[] = [];

    for (const rootFilePath of rootFilePaths) {
        rootFiles.push(await recursiveBuild(rootFilePath, props));
    }

    props.setCurrentlyRegisteredFiles(props.currentlyRegisteredFiles);

    return rootFiles;
}

export function compareItems(a: ProjectFile, b: ProjectFile): number {
    if (a.isFolder && !b.isFolder) {
        return -1;
    } else if (!a.isFolder && b.isFolder) {
        return 1;
    } else {
        return a.name.localeCompare(b.name);
    }
}

function ProjectView(props: CommonProps) {
    const [loadStarted, setLoadStarted] = useState(false);
    const [data, setData] = useState<ProjectFile[] | null>(null);

    props.invalidateFileSystem.current = () => {
        setLoadStarted(false);
    };

    if (!loadStarted) {
        setLoadStarted(true);
        buildProjectFiles(props).then((out) => setData(out));
    }

    if (data === null) {
        return <CenteredSpinner />;
    } else {
        return (
            <div className="d-flex flex-grow-1 flex-column">
                <Row className="border-bottom lt-border">
                    <Col className="pe-0 py-1 pb-2">
                        <h3 className="my-2 d-inline user-select-none">{props.project.name}</h3>
                    </Col>
                </Row>
                <Row className="flex-grow-1">
                    <Col className="position-relative overflow-y-auto">
                        <div className="position-absolute top-0 bottom-0">
                            {data.sort(compareItems).map((item) => (
                                <ProjectItem key={item.path} file={item} {...props} />
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ProjectView;
