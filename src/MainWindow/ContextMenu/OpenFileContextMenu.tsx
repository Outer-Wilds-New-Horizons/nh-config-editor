import { clipboard } from "@tauri-apps/api";
import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    BoxArrowUpRight,
    ClipboardFill,
    Save2Fill,
    X
} from "react-bootstrap-icons";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { useProject } from "../MainWindow";
import { openInExternal } from "../Store/FileUtils";
import { useAppDispatch, useAppSelector } from "../Store/Hooks";
import {
    closeOtherTabs,
    closeTab,
    closeTabsToTheLeft,
    closeTabsToTheRight,
    saveFileData,
    selectOpenFileByRelativePath
} from "../Store/OpenFilesSlice";
import MainWindowContextMenuType from "./MainWindowContextMenuType";

function OpenFileContextMenu() {
    const dispatch = useAppDispatch();
    const project = useProject()!;

    const selectedOpenFile = useAppSelector((state) => {
        if (state.contextMenu.currentTarget === null) return null;
        else return selectOpenFileByRelativePath(state.openFiles, state.contextMenu.currentTarget);
    });

    const openInExt = () => {
        if (selectedOpenFile) {
            openInExternal(selectedOpenFile);
        }
    };

    const copyPath = () => {
        if (selectedOpenFile) {
            clipboard.writeText(selectedOpenFile.absolutePath);
        }
    };

    const save = () => {
        if (selectedOpenFile) {
            dispatch(saveFileData({ file: selectedOpenFile, projectPath: project.path }));
        }
    };

    const close = () => {
        if (selectedOpenFile) {
            dispatch(closeTab(selectedOpenFile));
        }
    };

    const closeRight = () => {
        if (selectedOpenFile) {
            dispatch(closeTabsToTheRight(selectedOpenFile.tabIndex));
        }
    };

    const closeLeft = () => {
        if (selectedOpenFile) {
            dispatch(closeTabsToTheLeft(selectedOpenFile.tabIndex));
        }
    };

    const closeOther = () => {
        if (selectedOpenFile) {
            dispatch(closeOtherTabs(selectedOpenFile.tabIndex));
        }
    };

    return (
        <MainWindowContextMenuType id="openFile">
            <IconDropDownItem id="save" icon={<Save2Fill />} onClick={save} label="Save" />
            <IconDropDownItem
                id="openInExternal"
                icon={<BoxArrowUpRight />}
                onClick={openInExt}
                label="Open in External Editor"
            />
            <IconDropDownItem
                id="copyPath"
                icon={<ClipboardFill />}
                onClick={copyPath}
                label="Copy Path"
            />
            <IconDropDownItem id="separator" />
            <IconDropDownItem id="close" icon={<X />} onClick={close} label="Close" />
            <IconDropDownItem
                id="closeLeft"
                icon={<ArrowLeft />}
                onClick={closeLeft}
                label="Close Left"
            />
            <IconDropDownItem
                id="closeRight"
                icon={<ArrowRight />}
                onClick={closeRight}
                label="Close Right"
            />
            <IconDropDownItem
                id="closeOther"
                icon={<ArrowLeftRight />}
                onClick={closeOther}
                label="Close Other"
            />
        </MainWindowContextMenuType>
    );
}

export default OpenFileContextMenu;
