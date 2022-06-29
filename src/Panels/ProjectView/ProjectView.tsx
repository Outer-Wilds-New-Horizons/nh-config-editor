import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProjectItem from "./ProjectItem";
import {invoke} from "@tauri-apps/api/tauri";
import {Spinner} from "react-bootstrap";
import {useState} from "react";

export type ProjectFileType =
    "planet" |
    "system" |
    "translation" |
    "addon_manifest" |
    "mod_manifest" |
    "asset-bundle" |
    "xml" |
    "image" |
    "sound" |
    "other";

export class ProjectFile {

    isFolder: boolean;
    children: ProjectFile[];
    name: string;
    path: string;
    fileType: ProjectFileType;

    constructor(isFolder: boolean, children: ProjectFile[], name: string, path: string, fileType: ProjectFileType) {
        this.isFolder = isFolder;
        this.children = children;
        this.name = name;
        this.path = path;
        this.fileType = fileType;
    }
}

export type ProjectViewProps = {
    projectPath: string
}

async function recursiveBuild(path: string, rootPath: string): Promise<ProjectFile> {

    const is_dir = await invoke("is_dir", {path});

    const child_paths: string[] = is_dir ? await invoke("list_dir", {path}) : [];

    const [fileName, extension] = await invoke("get_metadata", {path});

    const rootDir: string | null = is_dir ? null : await invoke("root_dir", {path, rootPath});

    let fileType: ProjectFileType = "other";

    if (is_dir) {

        let children: ProjectFile[] = [];

        for (const childPath of child_paths) {
            children.push(await recursiveBuild(childPath, rootPath));
        }

        return new ProjectFile(true, children, fileName, path, "other");

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
        } else if (rootDir === "assets" && (extension === "bundle" || extension === "assetbundle")) {
            fileType = "asset-bundle";
        } else if (extension === "xml") {
            fileType = "xml";
        } else if (extension === "png" || extension === "jpg" || extension === "jpeg") {
            fileType = "image";
        } else if (extension === "mp3" || extension === "wav") {
            fileType = "sound";
        }

        return new ProjectFile(false, [], fileName, path, fileType);

    }

}

async function buildProjectFiles(projectPath: string): Promise<ProjectFile[]> {
    const rootFilePaths: string[] = await invoke("list_dir", {path: projectPath});
    const rootFiles: ProjectFile[] = [];

    for (const rootFilePath of rootFilePaths) {
        rootFiles.push(await recursiveBuild(rootFilePath, projectPath));
    }

    return rootFiles;
}

function ProjectView(props: ProjectViewProps) {

    const [loadStarted, setLoadStarted] = useState(false);
    const [data, setData] = useState<ProjectFile[] | null>(null);

    if (!loadStarted) {
        setLoadStarted(true);
        buildProjectFiles(props.projectPath).then((out) => setData(out));
    }

    if (data === null) return <Spinner animation={"border"} variant="primary"/>;

    return <>
        <Row className={"border-bottom"}>
            <Col>
                <h1>TestProject</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                {data.map(item => (<ProjectItem file={item}/>))}
            </Col>
        </Row>
    </>
}

export default ProjectView;

