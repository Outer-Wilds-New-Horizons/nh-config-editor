import { shell } from "@tauri-apps/api";
import { CaretRightFill, FolderFill, Tools, Wrench } from "react-bootstrap-icons";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { openRunWindow } from "../../RunWindow/RunWindow";
import { useAppDispatch } from "../Store/Hooks";
import { debugBuild, releaseBuild } from "../Store/ProjectFilesSlice";
import { useProject } from "../MainWindow";
import MenuBarGroup from "./MenuBarGroup";

function OpenExplorerItem() {
    const project = useProject()!;

    const onClick = () => {
        shell.open(project.path);
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+E"
            shortcut="ctrl+e,command+e"
            onClick={onClick}
            id="openExplorer"
            label="Show in Explorer"
            icon={<FolderFill />}
        />
    );
}

function RunItem() {
    const project = useProject();

    const onClick = () => {
        openRunWindow(project.path);
    };

    return (
        <IconDropDownItem
            annotation="F4"
            shortcut="f4"
            onClick={onClick}
            id="run"
            label="Run"
            icon={<CaretRightFill />}
        />
    );
}

function BuildDebugItem() {
    const dispatch = useAppDispatch();
    const project = useProject();

    const onClick = () => {
        dispatch(debugBuild({ project }));
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+Shift+B"
            shortcut="ctrl+shift+b,command+shift+b"
            onClick={onClick}
            id="output"
            label="Build Project (Debug)"
            icon={<Wrench />}
        />
    );
}

function BuildReleaseItem() {
    const dispatch = useAppDispatch();
    const project = useProject()!;

    const onClick = () => {
        dispatch(releaseBuild({ project }));
    };

    return (
        <IconDropDownItem
            annotation="Ctrl+B"
            shortcut="ctrl+b,command+b"
            onClick={onClick}
            id="build"
            label="Build Project (Release)"
            icon={<Tools />}
        />
    );
}

export function ProjectGroup() {
    return (
        <MenuBarGroup name="Project">
            <OpenExplorerItem />
            <RunItem />
            <BuildDebugItem />
            <BuildReleaseItem />
        </MenuBarGroup>
    );
}
