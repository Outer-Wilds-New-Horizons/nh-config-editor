import { sep } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import AsyncImage from "../../../Common/AsyncImage";
import { Project } from "../../../Common/Project";

export type ProjectViewHeaderProps = {
    project: Project;
};

function ProjectViewHeader(props: ProjectViewHeaderProps) {
    const [hasImage, setHasImage] = useState(false);

    invoke("file_exists", { path: `${props.project.path}${sep}subtitle.png` }).then((data) => {
        setHasImage(data as boolean);
    });

    if (hasImage) {
        return (
            <AsyncImage className="my-1" path={`${props.project.path}${sep}subtitle.png`} fluid />
        );
    } else {
        return <h3 className="user-select-none mb-1">{props.project.name}</h3>;
    }
}

export default ProjectViewHeader;
