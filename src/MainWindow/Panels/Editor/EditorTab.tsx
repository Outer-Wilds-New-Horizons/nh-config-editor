import { X } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import { ProjectFile } from "../ProjectView/ProjectFile";

export type EditorTabProps = {
    file: ProjectFile;
    active: boolean;
    onSelect?: () => void;
    onContextMenu?: (position: [number, number]) => void;
    onClose?: () => void;
};

function EditorTab(props: EditorTabProps) {
    let classes =
        "border-bottom editor-tab lt-border interactable d-flex border-end align-items-center justify-content-center px-2 py-1";

    if (props.active) {
        classes += " bg-primary text-white";
    }

    return (
        <Col xs="auto" className={classes}>
            <span
                className="d-flex align-items-center justify-content-center"
                onClick={props.onSelect}
                onContextMenu={(e) => props.onContextMenu?.([e.clientX, e.clientY])}
            >
                {props.file.getIcon()}
                <span className="ms-1">{props.file.name + (props.file.changed ? "*" : "")}</span>
            </span>
            <X onClick={props.onClose} className="small ms-1" />
        </Col>
    );
}

export default EditorTab;
