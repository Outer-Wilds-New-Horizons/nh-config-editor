import {cloneElement} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {ProjectFile} from "./ProjectFile";
import ProjectFolder from "./ProjectFolder";

export type ProjectItemProps = {
    file: ProjectFile,
    openFile: CallableFunction
}

function ProjectItem(props: ProjectItemProps) {

    if (props.file.isFolder) {
        return <ProjectFolder openFile={props.openFile} concrete={false} name={props.file.name}
                              children={props.file.children}/>;
    } else {
        return <Row className="interactable ms-2 w-100" onClick={() => props.openFile(props.file)}>
            <Col className="d-flex align-items-center">
                {cloneElement(props.file.getIcon(), {"className": "fs-6 my-auto"})}
                <span className="fs-5 ms-2">{props.file.name}</span>
            </Col>
        </Row>;
    }
}

export default ProjectItem;
