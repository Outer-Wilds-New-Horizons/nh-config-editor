import { useAppSelector } from "../../Store/Hooks";
import { selectProjectFileByRelativePath } from "../../Store/ProjectFilesSlice";
import ProjectFileView from "./ProjectFileView";
import ProjectFolderView from "./ProjectFolderView";

export type ProjectItemProps = {
    relativePath: string;
};

function ProjectItemView(props: ProjectItemProps) {
    const file = useAppSelector((state) =>
        selectProjectFileByRelativePath(state.projectFiles, props.relativePath)
    )!;

    return (
        <div>
            {file.isFolder ? <ProjectFolderView file={file} /> : <ProjectFileView file={file} />}
        </div>
    );
}

export default ProjectItemView;
