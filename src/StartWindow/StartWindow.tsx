import {ask, message, open} from "@tauri-apps/api/dialog";
import {documentDir} from "@tauri-apps/api/path";
import {exit} from "@tauri-apps/api/process";
import {WebviewWindow} from "@tauri-apps/api/window";
import {useEffect, useState} from "react";
import {DoorOpen, Folder2Open, Gear, PlusCircleDotted} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import {AppData} from "../Common/AppData";
import CenteredSpinner from "../Common/CenteredSpinner";
import {Project} from "../Common/Project";
import RecentProject from "./RecentProject";

const setup = async (): Promise<AppData> => {
    const data = await AppData.get();
    for (const project of data.recentProjects) {
        project.valid = await project.validate();
    }
    return data;
};


function StartWindow() {

    const [appData, setAppData] = useState<AppData | null>(null);

    useEffect(() => {
        setup().then(newAppData => {
            setAppData(newAppData);
        });
    }, []);

    if (appData === null) {
        return <CenteredSpinner/>;
    }

    const createProject = async () => {

        new WebviewWindow("new_project", {
            title: "New Project",
            url: "index.html#NEWPROJECT",
            width: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            resizable: false,
            focus: true
        });

    };

    const openProject = async (project: Project) => {

        if (project.valid) {
            const newData = new AppData();
            newData.recentProjects = appData.recentProjects.filter(p => p !== project);
            newData.recentProjects.unshift(project);
            await newData.save();
            setAppData(newData);
            await project.openInMain();
        } else {
            const result = await ask("This project is no longer valid. Do you want to remove it from recent projects?", {
                "title": "Project invalid"
            });
            if (result) {
                const newData = new AppData();
                newData.recentProjects = appData.recentProjects.filter(p => p !== project);
                await newData.save();
                setAppData(newData);
            }
        }
    };

    const locateProject = async () => {

        const targetPath = await open({
            title: "Open Project",
            directory: true,
            defaultPath: await documentDir(),
            multiple: false
        });

        if (targetPath !== null) {

            const newProject = await Project.load(targetPath as string);
            if (newProject === null) {
                await message("Failed To Load Project, Select The Folder That Contains manifest.json", {
                    type: "error",
                    title: "Couldn't Open Project"
                });
            } else {
                await openProject(newProject);
            }

        }

    };

    return <div className="d-flex vh-100">
        <Container className="d-flex flex-column mh-100 vh-100 my-auto">
            <Row className="border-bottom border-2 mt-5 mb-3">
                <Col xs={6}>
                    <h3>New Horizons Config Editor</h3>
                </Col>
                <Col className="d-flex align-items-center justify-content-end">
                    <Button className="d-flex align-items-center me-2 py-1 rounded-pill" size="sm"
                            variant="outline-secondary"><Gear className="me-2"/>Settings</Button>
                    <Button onClick={() => exit(0)} className="d-flex align-items-center py-1 rounded-pill" size="sm"
                            variant="outline-danger"><DoorOpen className="me-2"/>Quit</Button>
                </Col>
            </Row>
            <Row className="d-flex flex-grow-1">
                <Col className="d-flex flex-column" xs={8}>
                    <h6>Recent Projects:</h6>
                    <div className="position-relative border rounded border-1 h-75 p-5">
                        {appData.recentProjects.length === 0 &&
                            <div className="d-flex h-100 w-100 align-items-center justify-content-center">
                                <h6 className="text-muted small">When you create or open projects, they&apos;ll show up
                                    here.</h6>
                            </div>
                        }
                        {appData.recentProjects.length > 0 &&
                            <ListGroup
                                className="list-group-flush position-absolute top-0 bottom-0 end-0 start-0 overflow-y-auto">
                                {appData.recentProjects.slice().reverse().map(project =>
                                    <RecentProject key={project.path} onClick={() => openProject(project)}
                                                   project={project}/>
                                )}
                            </ListGroup>
                        }
                    </div>
                </Col>
                <Col>
                    <h6>Get Started:</h6>
                    <Row className="mb-5">
                        <Col>
                            <Button onClick={() => createProject()} className="w-100 h-100 py-5"
                                    variant="outline-primary" size="lg">
                                <PlusCircleDotted className="my-auto fs-1 my-auto mb-1 me-2"/>
                                <span className="d-block my-auto">New Project</span>
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={locateProject} className="w-100 h-100 py-5" variant="outline-secondary"
                                    size="lg">
                                <Folder2Open className="my-auto fs-1 my-auto mb-2 me-2"/>
                                <span className="d-block my-auto">Open Project</span>
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </div>;
}

export default StartWindow;
