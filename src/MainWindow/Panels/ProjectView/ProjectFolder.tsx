import {useState,} from "react";
import {Collapse,} from "react-bootstrap";
import {CaretRightFill, FolderFill,} from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {CommonProps} from "../../MainWindow";
import {ProjectFile,} from "./ProjectFile";
import ProjectItem from "./ProjectItem";
import {compareItems} from "./ProjectView";


export type ProjectFolderProps = {
    concrete: boolean;
    name: string;
    folderChildren: ProjectFile[];
} & CommonProps;

function ProjectFolder(props: ProjectFolderProps,) {

    const [open, setOpen,] = useState(false,);

    const commonProps: CommonProps = {
        currentlyRegisteredFiles: props.currentlyRegisteredFiles,
        invalidateFileSystem: props.invalidateFileSystem,
        openFiles: props.openFiles,
        projectPath: props.projectPath,
        selectedFile: props.selectedFile,
        setCurrentlyRegisteredFiles: props.setCurrentlyRegisteredFiles,
        setOpenFiles: props.setOpenFiles,
        setSelectedFile: props.setSelectedFile,
    };

    return <Row>
        <Col onClick={() => setOpen(!open,)} className={"d-flex w-100 interactable align-items-center"}>
            <span className={"d-flex align-items-center"}>
                <CaretRightFill className={`fs-6 my-auto folder-caret ${(open ? "open" : "")}`}/>
                <FolderFill className={"ms-1 my-auto"}/>
                <span className={"fs-5 ms-2"}>{props.name}</span>
            </span>
        </Col>
        <Collapse in={open}>
            <div className={"ms-4"}>
                {props.folderChildren.sort(compareItems).map(file => (
                    <ProjectItem key={file.path} file={file} {...commonProps}/>
                ),)}
            </div>
        </Collapse>
    </Row>;

}

export default ProjectFolder;
