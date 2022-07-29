import { process } from "@tauri-apps/api";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";
import { ReactElement } from "react";
import {
    DashCircleFill,
    DoorOpenFill,
    FileCheckFill,
    FileXFill,
    GearWide,
    HddFill,
    Save2Fill
} from "react-bootstrap-icons";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { openSettingsWindow } from "../../SettingsWindow/SettingsWindow";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import {
    closeAllUnchangedTabs,
    closeProjectConfirm,
    createVoidFile,
    quitConfirm,
    saveFileData,
    selectAllOpenFiles,
    selectFilesHaveUnsavedChanges,
    selectSelectedFile,
    selectTotalOpenFiles
} from "../../Store/OpenFiles";
import { invalidate } from "../../Store/ProjectFile";
import {
    addonManifestIcon,
    planetsIcon,
    systemsIcon,
    translationsIcon
} from "../../Store/FileUtils";
import { useProject } from "../MainWindow";
import MenuBarGroup from "./MenuBarGroup";

function NewFileItem(props: { label: string; icon: ReactElement; name: string }) {
    const dispatch = useAppDispatch();

    return (
        <IconDropDownItem
            onClick={() =>
                dispatch(createVoidFile({ name: props.name, rootDir: `${props.name}s` }))
            }
            id={`new_${props.name}`}
            label={`New ${props.label}`}
            icon={props.icon}
        />
    );
}

function SaveFileItem() {
    const project = useProject();
    const dispatch = useAppDispatch();
    const selectedFile = useAppSelector((state) => selectSelectedFile(state.openFiles));

    const onClick = () => {
        if (selectedFile) {
            dispatch(saveFileData({ file: selectedFile, projectPath: project!.path }));
        }
    };

    return (
        <IconDropDownItem
            disabled={
                selectedFile === undefined || selectedFile.memoryData === selectedFile.diskData
            }
            id="save"
            label="Save"
            onClick={onClick}
            icon={<Save2Fill />}
        />
    );
}

function SaveAllItem() {
    const project = useProject();
    const dispatch = useAppDispatch();
    const openFiles = useAppSelector((state) => selectAllOpenFiles(state.openFiles));

    const onClick = () => {
        for (const file of openFiles.filter((f) => f.memoryData !== f.diskData)) {
            dispatch(saveFileData({ file, projectPath: project!.path }));
        }
    };

    return (
        <IconDropDownItem
            onClick={onClick}
            disabled={!openFiles.some((f) => f.memoryData !== f.diskData)}
            id="saveAll"
            label="Save All"
            icon={<FileCheckFill />}
        />
    );
}

function ReloadDiskItem() {
    const dispatch = useAppDispatch();

    const onClick = () => {
        dispatch(invalidate());
    };

    return (
        <IconDropDownItem
            onClick={onClick}
            id="reloadFromDisk"
            label="Reload From Disk"
            icon={<HddFill />}
        />
    );
}

function CloseAllItem() {
    const dispatch = useAppDispatch();

    const totalOpen = useAppSelector((state) => selectTotalOpenFiles(state.openFiles));

    const onClick = () => {
        dispatch(closeAllUnchangedTabs());
    };

    return (
        <IconDropDownItem
            onClick={onClick}
            disabled={totalOpen === 0}
            id="closeAll"
            label="Close All Unchanged"
            icon={<FileXFill />}
        />
    );
}

const closeProject = () => {
    const webview = new WebviewWindow("welcome", {
        url: "index.html#START",
        title: "Welcome",
        center: true,
        minWidth: 1100,
        width: 1100,
        height: 650,
        minHeight: 650,
        resizable: true,
        maximized: true
    });

    webview.once("tauri://created", () => {
        WebviewWindow.getByLabel("run-game")?.close();
        getCurrent().close();
    });
};

function CloseProjectItem() {
    const unsavedChanges = useAppSelector((state) =>
        selectFilesHaveUnsavedChanges(state.openFiles)
    );

    const onClick = () => {
        if (unsavedChanges) {
            closeProjectConfirm().then(closeProject);
        } else {
            closeProject();
        }
    };

    return (
        <IconDropDownItem
            onClick={onClick}
            id="closeProject"
            label="Close Project"
            icon={<DashCircleFill />}
        />
    );
}

function QuitItem() {
    const unsavedChanges = useAppSelector((state) =>
        selectFilesHaveUnsavedChanges(state.openFiles)
    );

    const onClick = () => {
        if (unsavedChanges) {
            quitConfirm().then(() => process.exit(0));
        } else {
            process.exit(0);
        }
    };

    return <IconDropDownItem onClick={onClick} id="quit" label="Quit" icon={<DoorOpenFill />} />;
}

export function FileGroup() {
    return (
        <MenuBarGroup name="File">
            <NewFileItem label={"Planet"} icon={planetsIcon()} name={"planet"} />
            <NewFileItem label={"System"} icon={systemsIcon()} name={"system"} />
            <NewFileItem label={"Translation"} icon={translationsIcon()} name={"translation"} />
            <IconDropDownItem
                id="makeManifest"
                label="Create Addon Manifest"
                icon={addonManifestIcon()}
            />
            <IconDropDownItem id="separator" />
            <SaveFileItem />
            <SaveAllItem />
            <ReloadDiskItem />
            <CloseAllItem />
            <IconDropDownItem id="separator" />
            <IconDropDownItem
                onClick={openSettingsWindow}
                id="settings"
                label="Settings"
                icon={<GearWide />}
            />
            <IconDropDownItem id="separator" />
            <CloseProjectItem />
            <QuitItem />
        </MenuBarGroup>
    );
}
