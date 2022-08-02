import { message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { createContext, useContext } from "react";
import { Provider } from "react-redux";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import SchemaStoreManager from "../Common/AppData/SchemaStore";
import { Project } from "../Common/Project";

import "./main_window.css";
import MainWindowContextMenu from "./ContextMenu/MainWindowContextMenu";
import { store } from "./Store/Store";
import MainWindowBlur from "./MainWindowBlur";
import MainWindowMenuBar from "./MenuBar/MainWindowMenuBar";
import EditorFrame from "./Panels/Editor/EditorFrame";
import ProjectView from "./Panels/ProjectView/ProjectView";

const projectPath = new URLSearchParams(window.location.search).get("path");

let project: Project | null = null;

if (projectPath === null) {
    await message("No project path specified", {
        type: "error",
        title: "Error"
    });
    await exit(1);
} else {
    try {
        project = await Project.load(decodeURIComponent(projectPath));
    } catch (e) {
        await message(`${e}`, {
            type: "error",
            title: "Error"
        });
        await exit(1);
    }
}

const ProjectContext = createContext(project);

const schemaStore = await SchemaStoreManager.get();

function MainWindow() {
    return (
        <Provider store={store}>
            <ProjectContext.Provider value={project}>
                <MainWindowBlur />
                <MainWindowContextMenu />
                <Container fluid className="vh-100 flex-column d-flex">
                    <Row className="py-0">
                        <MainWindowMenuBar />
                    </Row>
                    <Row className="flex-grow-1 border-top lt-border overflow-hidden">
                        <Col className="d-flex flex-column border-end lt-border">
                            <ProjectView
                                projectPath={project!.path}
                                header={project!.name}
                                headerPath={`${project!.path}${sep}subtitle.png`}
                            />
                        </Col>
                        <Col className="p-0 h-100 d-flex flex-column" xs={8}>
                            <EditorFrame schemaStore={schemaStore} />
                        </Col>
                    </Row>
                </Container>
            </ProjectContext.Provider>
        </Provider>
    );
}

export default MainWindow;
export const useProject = () => useContext(ProjectContext);
