import { cloneElement } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ProjectFile } from "./ProjectFile";
import ProjectFolder from "./ProjectFolder";

export type ProjectItemProps = {
    file: ProjectFile;
    onOpenFile?: (file: ProjectFile) => void;
    onFileContextMenu?: (file: ProjectFile, position: [number, number]) => void;
};

function ProjectItem(props: ProjectItemProps) {
    return (
        <div>
            {props.file.isFolder ? (
                <ProjectFolder
                    onOpenFile={props.onOpenFile}
                    onFileContextMenu={props.onFileContextMenu}
                    folder={props.file}
                />
            ) : (
                <Row
                    className="interactable"
                    onContextMenu={(e) =>
                        props.onFileContextMenu?.(props.file, [e.clientX, e.clientY])
                    }
                    onClick={() => props.onOpenFile?.(props.file)}
                >
                    <Col className="d-flex align-items-center">
                        {cloneElement(props.file.getIcon(), { className: "my-auto ms-3" })}
                        <span className="fs-5 ms-2 text-nowrap">{props.file.name}</span>
                    </Col>
                </Row>
            )}
        </div>
    );
}

export default ProjectItem;
