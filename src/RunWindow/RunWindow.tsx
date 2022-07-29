import { invoke } from "@tauri-apps/api";
import { message } from "@tauri-apps/api/dialog";
import { sep } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { appWindow, WebviewWindow } from "@tauri-apps/api/window";
import React from "react";
import { Form, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { getModManagerSettings } from "../Common/ModManager";
import { Project } from "../Common/Project";
import DescriptionPopover from "../MainWindow/Panels/Editor/Editors/Inspector/FieldTemplates/DescriptionPopover";

export const openRunWindow = (projectPath: string) => {
    const current = WebviewWindow.getByLabel("run-game");

    if (current) {
        current.setFocus();
    } else {
        new WebviewWindow("run-game", {
            width: 500,
            height: 300,
            resizable: false,
            url: `index.html?path=${projectPath}#RUN`,
            title: "Run Game",
            focus: true
        });
    }
};

const params = new URLSearchParams(window.location.search);
const projectPath = params.get("path") ?? "";

let project: Project | undefined;

try {
    project = await Project.load(decodeURIComponent(projectPath));
} catch (e) {
    await message(`${e}`, {
        type: "error",
        title: "Error"
    });
    await exit(1);
}

function RunWindow() {
    const [logPort, setLogPort] = React.useState(50000);
    const [isRunning, setIsRunning] = React.useState(false);

    const onRun = async () => {
        setIsRunning(true);
        try {
            const modManagerSettings = await getModManagerSettings();
            await project?.copyToModsFolder(`${modManagerSettings.owmlPath}${sep}Mods`);
            await invoke("run_game", { owmlPath: modManagerSettings.owmlPath, port: logPort });
        } catch (e) {
            await message(`${e}`, {
                type: "error",
                title: "Error"
            });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="d-flex align-items-center vh-100">
            <Container className="mx-5" fluid>
                <Row className="mb-3 text-center border-bottom lt-border">
                    <Col>
                        <h1>Run Project</h1>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={8} className="d-flex align-items-center">
                        <Form.Label className="mb-0" htmlFor="logPort">
                            Log Port
                        </Form.Label>
                        <DescriptionPopover
                            id="logPort"
                            title="Log Port"
                            description={`The port is the first message displayed in the mod manager. It is
                                the number after the "Port: ", its usually in the 50000s. This is needed so that the game knows
                                what port to log messages to. This number changes whenever you restart the manager`}
                        />
                    </Col>
                    <Col>
                        <Form.Control
                            className="d-flex align-items-center h-100"
                            id="logPort"
                            value={logPort}
                            min={8000}
                            onChange={(e) => setLogPort(JSON.parse(e.target.value) as number)}
                            type="number"
                            required={true}
                        />
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Button disabled={isRunning} onClick={onRun} variant="outline-success">
                        {isRunning ? <Spinner size="sm" animation="border" /> : "Run"}
                    </Button>
                </Row>
                <Row>
                    <Button variant="outline-secondary" onClick={() => appWindow.close()}>
                        Close
                    </Button>
                </Row>
            </Container>
        </div>
    );
}

export default RunWindow;
