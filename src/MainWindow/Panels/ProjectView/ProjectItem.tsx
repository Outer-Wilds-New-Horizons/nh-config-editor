import {cloneElement} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {CommonProps} from "../../MainWindow";
import {ProjectFile} from "./ProjectFile";
import ProjectFolder from "./ProjectFolder";

export type ProjectItemProps = {
    file: ProjectFile
} & CommonProps;

function ProjectItem(props: ProjectItemProps) {

    if (props.file.isFolder) {
        return <ProjectFolder concrete={false} name={props.file.name}
                              folderChildren={props.file.children} {...props}/>;
    } else {
        return <Row className="interactable" onClick={() => props.file.open(props)}>
            <Col className="d-flex align-items-center">
                {cloneElement(props.file.getIcon(), {"className": "my-auto ms-3"})}
                <span className="fs-5 ms-2 text-nowrap">{props.file.name}</span>
            </Col>
        </Row>;
    }
}

export default ProjectItem;
