import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import 'bootstrap/dist/css/bootstrap.min.css';

import Inspector from "./Panels/Inspector/Inspector";
import {JSONSchema7} from "json-schema";

import body_schema from "./Schemas/body_schema.json";
import {useState} from "react";
import {open} from "@tauri-apps/api/dialog";
import {invoke} from "@tauri-apps/api/tauri";
import Col from "react-bootstrap/Col";
import ProjectView from "./Panels/ProjectView/ProjectView";

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

    const [schema, setSchema] = useState(body_schema as JSONSchema7);
    const [projectPath, setProjectPath] = useState("C:/Users/bwc67/AppData/Roaming/OuterWildsModManager/OWML/Mods/xen.RealSolarSystem");

    return (
        <div className="App h-100">
            <Container fluid>
                <Row>
                    <Col>
                        <ProjectView projectPath={projectPath}/>
                    </Col>
                    <Col xs={8}>
                        <Inspector schema={schema}/>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default App
