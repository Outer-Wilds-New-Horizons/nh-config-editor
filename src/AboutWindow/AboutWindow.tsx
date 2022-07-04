import {invoke} from "@tauri-apps/api";
import {getTauriVersion, getVersion} from "@tauri-apps/api/app";
import {ask, message} from "@tauri-apps/api/dialog";
import {arch, platform} from "@tauri-apps/api/os";
import {appDir} from "@tauri-apps/api/path";
import {relaunch} from "@tauri-apps/api/process";
import {open} from "@tauri-apps/api/shell";
import {WebviewWindow} from "@tauri-apps/api/window";
import {Github} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";

const version = await getVersion();
const platformName = await platform();
const tauriVersion = await getTauriVersion();
const architecture = await arch();

export const openAboutWindow = () => {
    new WebviewWindow("about", {
        title: "About",
        width: 400,
        height: 400,
        resizable: false,
        maximized: false,
        url: "index.html#ABOUT"
    });
};

function AboutWindow() {

    const resetData = async () => {
        const result = await ask("This will reset all data and relaunch the app. Are you sure?", {
            "title": "Reset data",
            "type": "warning"
        });
        if (result) {
            await invoke("delete_dir", {path: await appDir()});
            await message("Data reset. The app will now restart.", {
                "title": "Data reset"
            });
            await relaunch();
        }
    };

    return <Container className="vh-100 d-flex flex-column align-items-center justify-content-center">
        <Row className="mb-2">
            <Col>
                <Image className="rounded lt-border border" alt="New Horizons Logo" src="src/nh_logo.png"/>
            </Col>
        </Row>
        <Row>
            <Col>
                <h2>New Horizons Config Editor</h2>
            </Col>
        </Row>
        <Row className="mb-1">
            <Col>
                <a onClick={() => open("https://github.com/Bwc9876/nh-config-editor")}
                   className="d-flex align-items-center interactable text-decoration-none"><Github
                    className="me-1"/> GitHub</a>
            </Col>
        </Row>
        <Row>
            <Col>
                Version: {version}
            </Col>
        </Row>
        <Row>
            <Col>
                Tauri Version: {tauriVersion}
            </Col>
        </Row>
        <Row>
            <Col>
                Platform: {platformName}_{architecture}
            </Col>
        </Row>
        <Row className="mt-3">
            <Col>
                {/* Until I actually add an updating thing, this is all it will do */}
                <Button variant="outline-primary"
                        onClick={() => message("No Updates Available", {title: "Update Check"})}>Check For
                    Updates</Button>
            </Col>
        </Row>
        <Row className="mt-2">
            <Col>
                <Button onClick={resetData} variant="outline-danger">Reset Data</Button>
            </Col>
        </Row>
    </Container>;

}

export default AboutWindow;