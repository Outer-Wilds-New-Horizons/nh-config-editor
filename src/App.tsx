import {open} from "@tauri-apps/api/dialog";
import {invoke} from "@tauri-apps/api/tauri";
import "bootstrap/dist/css/bootstrap.min.css";

import {useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import EditorFrame from "./Panels/Editor/EditorFrame";
import {ProjectFile} from "./Panels/ProjectView/ProjectFile";
import ProjectView from "./Panels/ProjectView/ProjectView";

export type CommonProps = {
    openFiles: ProjectFile[],
    setOpenFiles: CallableFunction,
    selectedFile: ProjectFile | null,
    setSelectedFile: CallableFunction,
}

async function switchSchema(setSchema: CallableFunction) {
    const file: string | string[] | null = await open({
        multiple: false,
        directory: true
    });
    if (file !== null) {
        const dir = await invoke("list_dir", {path: file});
        console.log(dir);
    }
}

function App() {

    const [projectPath, setProjectPath] = useState("C:/Users/bwc67/AppData/Roaming/OuterWildsModManager/OWML/Mods/xen.RealSolarSystem");
    const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

    const commonProps: CommonProps = {
        openFiles,
        setOpenFiles,
        selectedFile,
        setSelectedFile
    };

    return (
        <Container fluid className={"vh-100"}>
            <Row className="h-100 overflow-hidden">
                <Col className="border-end h-100">
                    <ProjectView projectPath={projectPath} {...commonProps}/>
                </Col>
                <Col className="p-0 h-100" xs={8}>
                    <EditorFrame {...commonProps}/>
                </Col>
            </Row>
        </Container>
    );
}

export default App;
