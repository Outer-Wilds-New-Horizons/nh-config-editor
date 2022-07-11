import { ask, message, open } from "@tauri-apps/api/dialog";
import { documentDir } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";
import { WebviewWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import {
    ArrowRepeat,
    BoxArrowUpRight,
    DoorOpen,
    Folder2Open,
    GearWide,
    PlusCircleDotted,
    QuestionCircle
} from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { openAboutWindow } from "../AboutWindow/AboutWindow";
import RecentProjects from "../Common/AppData/RecentProjects";
import ContextMenu from "../Common/ContextMenu/ContextMenu";
import ContextMenuRoot, {
    ContextMenuActionRegistry,
    ContextMenuState
} from "../Common/ContextMenu/ContextMenuRoot";
import IconDropDownItem from "../Common/IconDropDownItem";
import { Project } from "../Common/Project";
import CenteredSpinner from "../Common/Spinner/CenteredSpinner";
import { openSettingsWindow } from "../SettingsWindow/SettingsWindow";
import RecentProject from "./RecentProject";

const contextMenuRegistry: ContextMenuActionRegistry = {
    recentProject: {}
};

function StartWindow() {
    const [recentProjects, setRecentProjects] = useState<Project[] | null>([]);
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
        currentId: "",
        x: 0,
        y: 0,
        target: null
    });

    const resetContextMenuState = () => {
        setContextMenuState({
            currentId: "",
            x: 0,
            y: 0,
            target: null
        });
    };

    useEffect(() => {
        RecentProjects.get().then(setRecentProjects);
    }, []);

    if (recentProjects === null) {
        return <CenteredSpinner />;
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
            const newRecentProjects = recentProjects.filter((p) => p.path !== project.path);
            newRecentProjects.unshift(project);
            await RecentProjects.save(newRecentProjects);
            setRecentProjects(newRecentProjects);
            await project.openInMain();
        } else {
            const result = await ask(
                "This project is no longer valid. Do you want to remove it from recent projects?",
                {
                    title: "Project invalid"
                }
            );
            if (result) {
                await removeProject(project);
            }
        }
    };

    const removeProject = async (project: Project) => {
        const newRecentProjects = recentProjects.filter((p) => p.path !== project.path);
        await RecentProjects.save(newRecentProjects);
        setRecentProjects(newRecentProjects);
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
                await message(
                    "Failed To Load Project, Select The Folder That Contains manifest.json",
                    {
                        type: "error",
                        title: "Couldn't Open Project"
                    }
                );
            } else {
                await openProject(newProject);
            }
        }
    };

    contextMenuRegistry["recentProject"]["openExplorer"] = (project: unknown) => {
        invoke("show_in_explorer", { path: (project as Project).path });
    };

    contextMenuRegistry["recentProject"]["reloadProject"] = async (oldProject: unknown) => {
        const project = oldProject as Project;
        const index = recentProjects.indexOf(project);
        const newProject =
            (await Project.load(project.path)) ??
            new Project("Error Loading Project", "", project.path);
        const newRecentProjects = recentProjects.slice(0);
        newRecentProjects[index] = newProject;
        await RecentProjects.save(newRecentProjects);
        setRecentProjects(newRecentProjects);
    };

    return (
        <>
            <ContextMenuRoot
                onMenuItemClicked={(menuId, actionId, target) => {
                    console.debug(`Context Action ${menuId}/${actionId} Done On:`, target);
                    contextMenuRegistry[menuId]?.[actionId]?.(target);
                    resetContextMenuState();
                }}
                {...contextMenuState}
            >
                <ContextMenu id="recentProject">
                    <IconDropDownItem
                        id="openExplorer"
                        label="Open in Explorer"
                        icon={<BoxArrowUpRight />}
                    />
                    <IconDropDownItem id="reloadProject" label="Reload" icon={<ArrowRepeat />} />
                </ContextMenu>
            </ContextMenuRoot>
            <div onClick={resetContextMenuState} className="d-flex vh-100">
                <Container className="d-flex flex-column mh-100 vh-100 my-auto">
                    <Row className="border-bottom border-secondary border-2 my-3">
                        <Col xs={6}>
                            <h3 className="user-select-none">New Horizons Config Editor</h3>
                        </Col>
                        <Col className="d-flex align-items-center justify-content-end">
                            <Button
                                onClick={openSettingsWindow}
                                className="d-flex align-items-center me-2 py-1 rounded-pill"
                                size="sm"
                                variant="outline-info"
                            >
                                <GearWide className="me-2" />
                                Settings
                            </Button>
                            <Button
                                onClick={openAboutWindow}
                                className="d-flex align-items-center py-1 me-2 rounded-pill"
                                size="sm"
                                variant="outline-secondary"
                            >
                                <QuestionCircle className="me-2" />
                                About
                            </Button>
                            <Button
                                onClick={() => exit(0)}
                                className="d-flex align-items-center py-1 rounded-pill"
                                size="sm"
                                variant="outline-danger"
                            >
                                <DoorOpen className="me-2" />
                                Quit
                            </Button>
                        </Col>
                    </Row>
                    <Row className="d-flex flex-grow-1">
                        <Col className="d-flex flex-column" xs={8}>
                            <h6>Recent Projects:</h6>
                            <div className="position-relative border lt-border rounded border-1 h-75 p-5">
                                {recentProjects.length === 0 && (
                                    <div className="d-flex h-100 w-100 align-items-center justify-content-center">
                                        <h6 className="text-muted small">
                                            When you create or open projects, they&apos;ll show up
                                            here.
                                        </h6>
                                    </div>
                                )}
                                {recentProjects.length > 0 && (
                                    <ListGroup className="list-group-flush position-absolute top-0 rounded-top bottom-0 end-0 start-0 overflow-y-auto">
                                        {recentProjects.map((project) => (
                                            <RecentProject
                                                key={project.path}
                                                onDeleteClick={() => removeProject(project)}
                                                onClick={() => openProject(project)}
                                                onContextMenu={(e) => {
                                                    setContextMenuState({
                                                        currentId: "recentProject",
                                                        target: project,
                                                        x: e.clientX,
                                                        y: e.clientY
                                                    });
                                                }}
                                                project={project}
                                            />
                                        ))}
                                    </ListGroup>
                                )}
                            </div>
                        </Col>
                        <Col>
                            <h6>Get Started:</h6>
                            <Row className="mb-5">
                                <Col>
                                    <Button
                                        onClick={() => createProject()}
                                        className="w-100 h-100 py-5"
                                        variant="outline-primary"
                                        size="lg"
                                    >
                                        <PlusCircleDotted className="my-auto fs-1 my-auto mb-1 me-2" />
                                        <span className="d-block my-auto">New Project</span>
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button
                                        onClick={locateProject}
                                        className="w-100 h-100 py-5"
                                        variant="outline-secondary"
                                        size="lg"
                                    >
                                        <Folder2Open className="my-auto fs-1 my-auto mb-2 me-2" />
                                        <span className="d-block my-auto">Open Project</span>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default StartWindow;
