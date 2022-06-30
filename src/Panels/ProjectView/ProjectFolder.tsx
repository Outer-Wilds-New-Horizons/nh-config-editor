import {useState} from "react";
import {Collapse} from "react-bootstrap";
import {CaretRightFill, FolderFill} from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {ProjectFile} from "./ProjectFile";
import ProjectItem from "./ProjectItem";


export type ProjectFolderProps = {
    concrete: boolean;
    name: string;
    children: ProjectFile[];
    openFile: CallableFunction;
}

function ProjectFolder(props: ProjectFolderProps) {

    const [open, setOpen] = useState(false);

    return <Row>
        <Col onClick={() => setOpen(!open)} className={"d-flex w-100 interactable align-items-center"}>
            <span className={"d-flex align-items-center"}>
                <CaretRightFill className={"fs-6 my-auto folder-caret " + (open ? "open" : "")}/>
                <FolderFill className={"ms-1 my-auto"}/>
                <span className={"fs-5 ms-2"}>{props.name}</span>
            </span>
        </Col>
        <Collapse in={open}>
            <div className={"ms-4"}>
                {props.children.map((file, i) => (
                    <ProjectItem key={file.path} file={file} openFile={props.openFile}/>
                ))}
            </div>
        </Collapse>
    </Row>

}

export default ProjectFolder;
