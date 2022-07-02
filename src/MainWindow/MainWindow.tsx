import {unregisterAll} from "@tauri-apps/api/globalShortcut";
import {invoke} from "@tauri-apps/api/tauri";

import {MutableRefObject, useEffect, useRef, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import CenteredSpinner from "../Common/CenteredSpinner";
import {ActionRegistry, setupAllEvents} from "./Events";
import EditorFrame from "./Panels/Editor/EditorFrame";
import {ProjectFile, ProjectFileType} from "./Panels/ProjectView/ProjectFile";
import ProjectView from "./Panels/ProjectView/ProjectView";

export type PathToFile = { [key: string]: ProjectFile };

export type CommonProps = {
    openFiles: ProjectFile[],
    setOpenFiles: CallableFunction,
    selectedFile: ProjectFile | null,
    setSelectedFile: CallableFunction,
    currentlyRegisteredFiles: PathToFile,
    setCurrentlyRegisteredFiles: CallableFunction,
    projectPath: string,
    invalidateFileSystem: MutableRefObject<CallableFunction>
}

function MainWindow() {

    // noinspection JSUnusedLocalSymbols
    const [projectPath, setProjectPath] = useState("C:\\Users\\bwc67\\AppData\\Roaming\\OuterWildsModManager\\OWML\\Mods\\xen.RealSolarSystem");
    const [openFiles, setOpenFiles] = useState<ProjectFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [currentlyRegisteredFiles, setCurrentlyRegisteredFiles] = useState<PathToFile>({});
    const invalidateFileSystem = useRef(() => {
        return;
    });

    const commonProps: CommonProps = {
        openFiles,
        setOpenFiles,
        selectedFile,
        setSelectedFile,
        currentlyRegisteredFiles,
        setCurrentlyRegisteredFiles,
        projectPath,
        invalidateFileSystem
    };

    const [loadDone, setLoadDone] = useState(false);
    const [actionRegistry, setActionRegistry] = useState<ActionRegistry>({});

    useEffect(() => {
        let unregisterMenus: CallableFunction | null = null;
        setupAllEvents().then(([unregister, registry]) => {
            setLoadDone(true);
            setActionRegistry(registry);
            unregisterMenus = unregister;
        });
        return () => {
            if (unregisterMenus) unregisterMenus();
            unregisterAll();
        };
    }, []);

    if (!loadDone) {
        return <div className={"vh-100"}>
            <CenteredSpinner animation={"border"} variant={"primary"}/>
        </div>;
    }

    const createNewFile = (fileType: ProjectFileType) => {

        let currentNumber = 1;

        while (openFiles.filter(file => file.name === `new_${fileType}_${currentNumber}.json`).length > 0) currentNumber++;

        ProjectFile.createNew(commonProps, `new_${fileType}_${currentNumber}.json`, fileType);

    };

    actionRegistry["New Planet"].callback = () => createNewFile("planet");
    actionRegistry["New Star System"].callback = () => createNewFile("system");
    actionRegistry["New Translation"].callback = () => createNewFile("translation");

    const findOrMakeAddonManifest = async () => {
        const filePath = `${projectPath}/addon-manifest.json`;
        if (!(await invoke("file_exists", {path: filePath}))) {
            const newFile = new ProjectFile(false, [], "addon-manifest.json", filePath, "addon_manifest");
            newFile.data = {};
            await newFile.save(commonProps);
            invalidateFileSystem.current();
        }
    };

    actionRegistry["Create Addon Manifest"].callback = () => {
        findOrMakeAddonManifest().then(() => {
            currentlyRegisteredFiles[`${projectPath}/addon-manifest.json`].open(commonProps);
        });
    };

    actionRegistry["Save"].callback = () => {
        console.log("Save Clicked");
        selectedFile?.save(commonProps);
    };

    actionRegistry["Save All"].callback = () => {
        for (const file of openFiles) {
            file.save(commonProps);
        }
    };

    actionRegistry["Close"].callback = () => {
        selectedFile?.close(commonProps);
    };

    // Close Project

    actionRegistry["Reload Project"].callback = () => {
        invalidateFileSystem.current();
    };

    actionRegistry["Open In Explorer"].callback = () => {
        invoke("show_in_explorer", {path: projectPath});
    };

    actionRegistry["Build Project"].callback = () => {
        invoke("zip_project", {path: projectPath, outputZipName: "TestBuild.zip"}).then(() => {
            invoke("show_in_explorer", {path: `${projectPath}\\build`});
        });
    };


    return (
        <Container fluid className={"vh-100"}>
            <Row className="h-100 overflow-hidden">
                <Col className="border-end h-100">
                    <ProjectView {...commonProps}/>
                </Col>
                <Col className="p-0 h-100" xs={8}>
                    <EditorFrame {...commonProps}/>
                </Col>
            </Row>
        </Container>
    );
}

export default MainWindow;
