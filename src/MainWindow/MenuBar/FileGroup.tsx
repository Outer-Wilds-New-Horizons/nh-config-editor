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
import { useAppDispatch, useAppSelector } from "../Store/Hooks";
import {
    closeAllTabs,
    closeProjectConfirm,
    createVoidFile,
    quitConfirm,
    saveFileData,
    selectAllOpenFiles,
    selectFilesHaveUnsavedChanges,
    selectOpenFileByRelativePath,
    selectTotalOpenFiles
} from "../Store/OpenFilesSlice";
import { invalidate } from "../Store/ProjectFilesSlice";
import { addonManifestIcon, planetsIcon, systemsIcon, translationsIcon } from "../Store/FileUtils";
import MenuBarGroup from "./MenuBarGroup";

function NewFileItem(props: {
    label: string;
    icon: ReactElement;
    name: string;
    shortcutLetter: string;
}) {
    const projectPath = useAppSelector((state) => state.project.path);
    const dispatch = useAppDispatch();

    return (
        <IconDropDownItem
            annotation={`Ctrl+N+${props.shortcutLetter.toUpperCase()}`}
            shortcut={`ctrl+n+${props.shortcutLetter},command+n+${props.shortcutLetter}`}
            onClick={() =>
                dispatch(
                    createVoidFile({
                        name: props.name,
                        rootDir: `${props.name}s`,
                        projectPath: projectPath
                    })
                )
            }
            id={`new_${props.name}`}
            label={`New ${props.label}`}
            icon={props.icon}
        />
    );
}

function SaveFileItem() {
    const projectPath = useAppSelector((state) => state.project.path);
    const dispatch = useAppDispatch();
    const selectedIndex = useAppSelector((state) => state.openFiles.selectedTabIndex);
    const selectedFile = useAppSelector((state) =>
        selectOpenFileByRelativePath(state.openFiles, state.openFiles.tabs[selectedIndex])
    );

    const onClick = () => {
        if (selectedIndex !== -1 && selectedFile !== undefined) {
            dispatch(saveFileData({ file: selectedFile, projectPath: projectPath }));
        }
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+S"
            shortcut="ctrl+s,command+s"
            disabled={
                selectedIndex === -1 ||
                selectedFile === undefined ||
                selectedFile.memoryData === selectedFile.diskData
            }
            id="save"
            label="Save"
            onClick={onClick}
            icon={<Save2Fill />}
        />
    );
}

function SaveAllItem() {
    const projectPath = useAppSelector((state) => state.project.path);
    const dispatch = useAppDispatch();
    const openFiles = useAppSelector((state) => selectAllOpenFiles(state.openFiles));

    const onClick = () => {
        for (const file of openFiles.filter((f) => f.memoryData !== f.diskData)) {
            dispatch(saveFileData({ file, projectPath }));
        }
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+Shift+S"
            shortcut="ctrl+shift+s,command+shift+s"
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
            annotation="Ctrl+Y"
            shortcut="ctrl+y,command+y"
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
        dispatch(closeAllTabs());
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+Shift+W"
            shortcut="ctrl+shift+w,command+shift+w"
            onClick={onClick}
            disabled={totalOpen === 0}
            id="closeAll"
            label="Close All"
            icon={<FileXFill />}
        />
    );
}

const closeProject = () => {
    const webview = new WebviewWindow("start", {
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
            annotation="Ctrl+Alt+Q"
            shortcut="ctrl+alt+q,command+alt+q"
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

    return (
        <IconDropDownItem
            annotation="Ctrl+Q"
            shortcut="ctrl+q,command+q"
            onClick={onClick}
            id="quit"
            label="Quit"
            icon={<DoorOpenFill />}
        />
    );
}

export function FileGroup() {
    return (
        <MenuBarGroup name="File">
            <NewFileItem label={"Planet"} icon={planetsIcon()} name={"planet"} shortcutLetter="p" />
            <NewFileItem label={"System"} icon={systemsIcon()} name={"system"} shortcutLetter="s" />
            <NewFileItem
                label={"Translation"}
                icon={translationsIcon()}
                name={"translation"}
                shortcutLetter="t"
            />
            <IconDropDownItem
                annotation="Ctrl+N+A"
                shortcut="ctrl+n+a,command+n+a"
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
                annotation="Ctrl+Alt+S"
                shortcut="ctrl+alt+s,command+alt+s"
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
