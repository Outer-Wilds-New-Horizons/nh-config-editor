import { clipboard } from "@tauri-apps/api";
import { BoxArrowUpRight, ClipboardFill, TrashFill } from "react-bootstrap-icons";
import IconDropDownItem from "../../Common/IconDropDownItem";
import { openInExternal } from "../Store/FileUtils";
import { useAppDispatch, useAppSelector } from "../Store/Hooks";
import { deleteFile, selectProjectFileByRelativePath } from "../Store/ProjectFilesSlice";
import MainWindowContextMenuType from "./MainWindowContextMenuType";

function ProjectFileContextMenu() {
    const dispatch = useAppDispatch();

    const selectedProjectFile = useAppSelector((state) => {
        if (state.contextMenu.currentTarget === null) return null;
        else
            return selectProjectFileByRelativePath(
                state.projectFiles,
                state.contextMenu.currentTarget
            );
    });

    const openInExt = () => {
        if (selectedProjectFile) {
            openInExternal(selectedProjectFile);
        }
    };

    const copyPath = () => {
        if (selectedProjectFile) {
            clipboard.writeText(selectedProjectFile.absolutePath);
        }
    };

    const delFile = () => {
        if (selectedProjectFile) {
            dispatch(deleteFile(selectedProjectFile));
        }
    };

    return (
        <MainWindowContextMenuType id="projectFile">
            <IconDropDownItem
                id="openInDefault"
                label="Open in External Editor"
                onClick={openInExt}
                icon={<BoxArrowUpRight />}
            />
            <IconDropDownItem
                id="copyPath"
                label="Copy Path"
                onClick={copyPath}
                icon={<ClipboardFill />}
            />
            <IconDropDownItem
                id="deleteFile"
                label="Delete File"
                onClick={delFile}
                icon={<TrashFill />}
            />
        </MainWindowContextMenuType>
    );
}

export default ProjectFileContextMenu;
