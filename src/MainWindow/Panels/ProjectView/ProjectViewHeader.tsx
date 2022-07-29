import { useEffect, useState } from "react";
import AsyncImage from "../../../Common/AsyncImage";
import { tauriCommands } from "../../../Common/TauriCommands";

export type ProjectViewHeaderProps = {
    headerFallback: string;
    headerPath: string;
};

function ProjectViewHeader(props: ProjectViewHeaderProps) {
    const [hasImage, setHasImage] = useState(false);

    useEffect(() => {
        tauriCommands.fileExists(props.headerPath).then(setHasImage);
    }, [props.headerPath]);

    if (hasImage) {
        return <AsyncImage className="my-1" path={props.headerPath} fluid />;
    } else {
        return <h3 className="user-select-none mb-1">{props.headerFallback}</h3>;
    }
}

export default ProjectViewHeader;
