import { EnhancedStore } from "@reduxjs/toolkit";
import { sep } from "@tauri-apps/api/path";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import SchemaStoreManager, { SchemaStore } from "../Common/AppData/SchemaStore";
import { loadProjectFromURLParams, Project } from "../Common/Project";

import "./main_window.css";
import CenteredSpinner from "../Common/Spinner/CenteredSpinner";
import MainWindowContextMenu from "./ContextMenu/MainWindowContextMenu";
import { windowBlur } from "./Store/BlurSlice";
import { RootState, setupStore } from "./Store/Store";
import MainWindowBlur from "./MainWindowBlur";
import MainWindowMenuBar from "./MenuBar/MainWindowMenuBar";
import EditorFrame from "./Panels/Editor/EditorFrame";
import ProjectView from "./Panels/ProjectView/ProjectView";

const ProjectContext = createContext<Project>(new Project("", "", ""));

function MainWindow(props: { testStore?: EnhancedStore<RootState> }) {
    const [project, setProject] = useState<Project>(new Project("", "", ""));
    const [schemaStore, setSchemaStore] = useState<SchemaStore | null>(null);
    const store = useMemo(() => props.testStore ?? setupStore(), []);

    useEffect(() => {
        (async () => {
            const loadedProject = await loadProjectFromURLParams();
            // This NNA is safe because if the project fails to load, the app will exit
            setProject(loadedProject!);
            setSchemaStore(await SchemaStoreManager.get());
            store.dispatch(windowBlur.setStatus("idle"));
        })().catch((e) => {
            store.dispatch(windowBlur.showError(e.toString()));
        });
    }, []);

    if (schemaStore === null) {
        return <CenteredSpinner />;
    }

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
