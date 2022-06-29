import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProjectItem from "./ProjectItem";
import {invoke} from "@tauri-apps/api/tauri";
import {useAsync} from "react-async";
import {Spinner} from "react-bootstrap";

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

    //console.log(`Building ${path}`);

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

        console.log(rootDir);

        if (rootDir === "planets" && extension === "json") {
            fileType = "planet";
        } else if (rootDir === "systems" && extension === "json") {
            fileType = "system";
        } else if (rootDir === "translations" && extension === "json") {
            fileType = "translation";
        } else if (rootDir === null && fileName === "addon-manifest.json") {
            fileType = "addon_manifest";
        } else if (rootDir === null && fileName === "manifest.json") {
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

async function buildProject(projectPath: string): Promise<ProjectFile[]> {

    const rootFilePaths: string[] = await invoke("list_dir", {path: projectPath});
    const rootFiles: ProjectFile[] = [];
    for (const rootFilePath of rootFilePaths) {

        console.log(`Building ${rootFilePath}`);

        rootFiles.push(await recursiveBuild(rootFilePath, projectPath));
    }

    console.log(rootFiles);

    return rootFiles;
}

function ProjectView() {

    const testProjectPath: string = "C:/Users/bwc67/AppData/Roaming/OuterWildsModManager/OWML/Mods/xen.RealSolarSystem"

    const {data, error, isPending} = useAsync({promise: buildProject(testProjectPath), promiseArgs: [testProjectPath]});

    if (isPending) return <Spinner animation={"border"} variant="primary"/>;
    if (error) return <div>Error: {error.message}</div>;
    if (data === undefined) return <div>No data</div>;

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

