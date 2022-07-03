import ListGroup from "react-bootstrap/ListGroup";
import {Project} from "../Common/Project";


export type RecentProjectProps = {
    project: Project,
    onClick?: () => void
}


function RecentProject(props: RecentProjectProps) {
    return <ListGroup.Item onClick={props.onClick} action
                           className={`interactable border-bottom text-nowrap`}>
        <span className="user-select-none">{props.project.name}</span>
        <span className="text-muted d-block text-truncate ms-2 small user-select-none">{props.project.path}</span>
    </ListGroup.Item>;
}

export default RecentProject;
