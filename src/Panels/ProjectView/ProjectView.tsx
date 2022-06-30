import {invoke} from "@tauri-apps/api/tauri";
import {useState} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {CommonProps} from "../../App";
import CenteredSpinner from "../Common/CenteredSpinner";
import {ProjectFile, ProjectFileType} from "./ProjectFile";
import ProjectItem from "./ProjectItem";

export type ProjectViewProps = { projectPath: string } & CommonProps;

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
        } else if (extension === "" || extension === "bundle" || extension === "assetbundle") {
            fileType = "asset-bundle";
        } else if (extension === "xml") {
            fileType = "xml";
        } else if (extension === "png" || extension === "jpg" || extension === "jpeg") {
            fileType = "image";
        } else if (extension === "mp3" || extension === "wav") {
            fileType = "sound";
        } else if (extension === "dll") {
            fileType = "binary";
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

    if (data === null) return <CenteredSpinner animation={"border"} variant={"primary"}/>;

    const openFile = (file: ProjectFile) => {

        const check = props.openFiles.filter(f => f.path === file.path);

        if (check.length === 0) {
            props.setOpenFiles(props.openFiles.concat([file]));
        }

        props.setSelectedFile(file);

    };

    return <>
        <Row className={"border-bottom"}>
            <Col>
                <h3 className={"my-2"}>TestProject</h3>
            </Col>
        </Row>
        <Row className={"border-bottom"}>
            <Col>
                {data.map(item => (<ProjectItem key={item.path} openFile={openFile} file={item}/>))}
            </Col>
        </Row>
    </>
}

export default ProjectView;

