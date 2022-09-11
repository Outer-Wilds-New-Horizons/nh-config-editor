import { EnhancedStore } from "@reduxjs/toolkit";
import { useEffect, useMemo } from "react";
import { Provider } from "react-redux";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import "./main_window.css";
import MainWindowContextMenu from "./ContextMenu/MainWindowContextMenu";
import { loadProject } from "./Store/ProjectSlice";
import { RootState, setupStore } from "./Store/Store";
import MainWindowBlur from "./MainWindowBlur";
import MainWindowMenuBar from "./MenuBar/MainWindowMenuBar";
import EditorFrame from "./Panels/Editor/EditorFrame";
import ProjectView from "./Panels/ProjectView/ProjectView";

function MainWindow(props: { testStore?: EnhancedStore<RootState> }) {
    const store = useMemo(() => props.testStore ?? setupStore(), []);

    useEffect(() => {
        store.dispatch(loadProject());
    }, []);

    return (
        <Provider store={store}>
            <MainWindowBlur />
            <MainWindowContextMenu />
            <Container fluid className="vh-100 flex-column d-flex">
                <Row className="py-0">
                    <MainWindowMenuBar />
                </Row>
                <Row className="flex-grow-1 border-top lt-border overflow-hidden">
                    <Col className="d-flex flex-column border-end lt-border">
                        <ProjectView />
                    </Col>
                    <Col className="p-0 h-100 d-flex flex-column" xs={8}>
                        <EditorFrame />
                    </Col>
                </Row>
            </Container>
        </Provider>
    );
}

export default MainWindow;
