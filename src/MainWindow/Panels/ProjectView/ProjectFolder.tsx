import { useState } from "react";
import { Collapse } from "react-bootstrap";
import { CaretRightFill, FolderFill } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ProjectFile } from "./ProjectFile";
import ProjectItem from "./ProjectItem";
import { compareItems } from "./ProjectView";

export type ProjectFolderProps = {
    folder: ProjectFile;
    onOpenFile?: (file: ProjectFile) => void;
    onFileContextMenu?: (file: ProjectFile, position: [number, number]) => void;
};

function ProjectFolder(props: ProjectFolderProps) {
    const [open, setOpen] = useState(false);

    return (
        <Row>
            <Col
                onClick={() => setOpen(!open)}
                onContextMenu={(e) =>
                    props.onFileContextMenu?.(props.folder, [e.clientX, e.clientY])
                }
                className="ps-2 d-flex w-100 interactable align-items-center"
            >
                <span className="d-flex align-items-center pe-0 me-0">
                    <CaretRightFill className={`fs-6 my-auto folder-caret ${open ? "open" : ""}`} />
                    <FolderFill className="ms-1 my-auto" />
                    <span className="fs-5 ms-2">{props.folder.name}</span>
                </span>
            </Col>
            <Collapse in={open}>
                <div className="ms-4">
                    {props.folder.children.sort(compareItems).map((file) => (
                        <ProjectItem
                            onOpenFile={props.onOpenFile}
                            onFileContextMenu={props.onFileContextMenu}
                            key={file.path}
                            file={file}
                        />
                    ))}
                </div>
            </Collapse>
        </Row>
    );
}

export default ProjectFolder;
