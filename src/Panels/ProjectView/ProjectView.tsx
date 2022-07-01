import {invoke,} from "@tauri-apps/api/tauri";
import {useState,} from "react";
import {Button} from "react-bootstrap";
import {ArrowClockwise} from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {CommonProps,} from "../../App";
import CenteredSpinner from "../Common/CenteredSpinner";
import {ProjectFile, ProjectFileType,} from "./ProjectFile";
import ProjectItem from "./ProjectItem";

export type ProjectViewProps = { projectPath: string } & CommonProps;

async function recursiveBuild(path: string, props: CommonProps): Promise<ProjectFile> {

    const isDir: boolean = await invoke("is_dir", {path,});

    const childPaths: string[] = isDir ? await invoke("list_dir", {path,}) : [];

    const [fileName, extension,] = await invoke("get_metadata", {path,});

    const rootDir: string | null = isDir ? null : await invoke("root_dir", {path, rootPath: props.projectPath});

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
        props.currentlyRegisteredFiles[path] = new ProjectFile(isDir, children, fileName, path, fileType);
    }

    return props.currentlyRegisteredFiles[path];

}

async function buildProjectFiles(props: CommonProps): Promise<ProjectFile[]> {
    const rootFilePaths: string[] = await invoke("list_dir", {path: props.projectPath});
    const rootFiles: ProjectFile[] = [];

    for (const rootFilePath of rootFilePaths) {
        rootFiles.push(await recursiveBuild(rootFilePath, props));
    }

    props.setCurrentlyRegisteredFiles(props.currentlyRegisteredFiles);

    return rootFiles;
}

function ProjectView(props: ProjectViewProps,) {

    const [loadStarted, setLoadStarted,] = useState(false);
    const [data, setData] = useState<ProjectFile[] | null>(null,);

    props.invalidateFileSystem.current = () => {
        setLoadStarted(false);
    };

    if (!loadStarted) {
        setLoadStarted(true);
        buildProjectFiles(props).then((out) => setData(out));
    }

    if (data === null) {
        return <CenteredSpinner animation="border" variant="primary"/>;
    } else {
        return <>
            <Row className="border-bottom">
                <Col className="pe-0">
                    <h3 className="my-2 d-inline">TestProject</h3>
                    <Button onClick={() => setLoadStarted(false)} aria-label="Reload Project" variant="link" size="sm"
                            className="float-end h-100 d-block my-auto">
                        <ArrowClockwise/>
                    </Button>
                </Col>
            </Row>
            <Row className={"border-bottom"}>
                <Col>
                    {data.map(item => (<ProjectItem key={item.path} file={item} {...props}/>))}
                </Col>
            </Row>
        </>;
    }

}

export default ProjectView;

