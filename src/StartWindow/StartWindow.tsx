import {message, open} from "@tauri-apps/api/dialog";
import {documentDir} from "@tauri-apps/api/path";
import {exit} from "@tauri-apps/api/process";
import {useEffect, useState} from "react";
import {DoorOpen, Folder2Open, GearWide, PlusCircleDotted} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import CenteredSpinner from "../Common/CenteredSpinner";
import {Project} from "../Common/Project";
import {AppData} from "../Common/Settings";
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
        return <CenteredSpinner animation="border" variant="primary"/>;
    }

    const openProject = async () => {

        const targetPath = await open({
            title: "Open Project",
            directory: true,
            defaultPath: await documentDir(),
            multiple: false
        });

        if (targetPath !== null) {

            const newProject = await Project.load(targetPath as string);
            if (newProject === null) {
                await message("Failed To Load Project, Select the folder that contains manifest.json", {
                    type: "error",
                    title: "Couldn't Open Project"
                });
            } else {
                const newData = new AppData();
                Object.assign(newData, appData);
                newData.recentProjects = appData.recentProjects.filter(project => project.path !== newProject.path);
                newData.recentProjects.push(newProject);
                await newData.save();
                setAppData(newData);
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
                            variant="outline-secondary"><GearWide className="me-2"/>Settings</Button>
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
                                <h6 className="text-muted small">When you add or open projects, they&apos;ll show up
                                    here.</h6>
                            </div>
                        }
                        {appData.recentProjects.length > 0 &&
                            <ListGroup
                                className="list-group-flush position-absolute top-0 bottom-0 end-0 start-0 overflow-y-auto">
                                {appData.recentProjects.reverse().map(project =>
                                    <RecentProject key={project.path} project={project}/>
                                )}
                            </ListGroup>
                        }
                    </div>
                </Col>
                <Col>
                    <h6>Get Started:</h6>
                    <Row className="mb-5">
                        <Col>
                            <Button className="w-100 h-100 py-5" variant="outline-primary" size="lg">
                                <PlusCircleDotted className="my-auto fs-1 my-auto mb-1 me-2"/>
                                <span className="d-block my-auto">New Project</span>
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={openProject} className="w-100 h-100 py-5" variant="outline-secondary"
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
