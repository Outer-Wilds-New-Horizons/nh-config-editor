import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import AsyncImage from "../../../Common/AsyncImage";

export type ProjectViewHeaderProps = {
    headerFallback: string;
    headerPath: string;
};

function ProjectViewHeader(props: ProjectViewHeaderProps) {
    const [hasImage, setHasImage] = useState(false);

    invoke("file_exists", { path: props.headerPath }).then((data) => {
        setHasImage(data as boolean);
    });

    if (hasImage) {
        return <AsyncImage className="my-1" path={props.headerPath} fluid />;
    } else {
        return <h3 className="user-select-none mb-1">{props.headerFallback}</h3>;
    }
}

export default ProjectViewHeader;
