import { MouseEvent } from "react";
import { contextMenu } from "../../Store/ContextMenuSlice";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import { selectProjectFileByRelativePath } from "../../Store/ProjectFilesSlice";
import ProjectFileView from "./ProjectFileView";
import ProjectFolderView from "./ProjectFolderView";

export type ProjectItemProps = {
    relativePath: string;
};

function ProjectItemView(props: ProjectItemProps) {
    const dispatch = useAppDispatch();

    const file = useAppSelector((state) =>
        selectProjectFileByRelativePath(state.projectFiles, props.relativePath)
    )!;

    const onContext = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(
            contextMenu.openMenu({
                menu: "projectFile",
                target: file.relativePath,
                position: [e.clientX, e.clientY]
            })
        );
    };

    return (
        <div onContextMenu={onContext}>
            {file.isFolder ? <ProjectFolderView file={file} /> : <ProjectFileView file={file} />}
        </div>
    );
}

export default ProjectItemView;
