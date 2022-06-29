import {ProjectFile} from "./ProjectView";
import {useState} from "react";
import {CaretRightFill} from "react-bootstrap-icons";
import {Collapse} from "react-bootstrap";
import ProjectItem from "./ProjectItem";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


export type ProjectFolderProps = {
    concrete: boolean;
    name: string;
    children: ProjectFile[];
}

function ProjectFolder(props: ProjectFolderProps) {

    const [open, setOpen] = useState(false);

    return <Row>
        <Col onClick={() => setOpen(!open)} className={"d-flex w-100 object-header align-items-center"}>
            <span>
                <CaretRightFill className={"fs-6 my-auto folder-caret " + (open ? "open" : "")}/>
                <span className={"fs-5 ms-2"}>{props.name}</span>
            </span>
        </Col>
        <Collapse in={open}>
            <div className={"pb-2 ms-4"}>
                {props.children.map((file, i) => (
                    <ProjectItem file={file} key={i}/>
                ))}
            </div>
        </Collapse>
    </Row>

}

export default ProjectFolder;
