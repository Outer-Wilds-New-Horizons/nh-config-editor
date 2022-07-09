import { useState } from "react";
import { X } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import { CommonProps } from "../../MainWindow";
import { EditorProps } from "./Editor";

export type EditorTabProps = { index: number } & EditorProps & CommonProps;

function EditorTab(props: EditorTabProps) {
    let classes =
        "border-bottom editor-tab lt-border interactable d-flex border-end align-items-center justify-content-center px-2 py-1";

    const [changed, setChanged] = useState(props.file.path.startsWith("@@void@@"));

    props.file.setChanged = setChanged;
    props.file.changed = changed;

    if (props.selectedFile === props.file) {
        classes += " bg-primary text-white";
    }

    return (
        <Col
            onContextMenu={(e) =>
                props.openContextMenu.current(
                    "editorTab",
                    e.clientX,
                    e.clientY,
                    props.file.name,
                    props.index
                )
            }
            xs="auto"
            className={classes}
        >
            <span
                className="d-flex align-items-center justify-content-center"
                onClick={() => props.setSelectedFile(props.file)}
            >
                {props.file.getIcon()}
                <span className="ms-1">{props.file.name + (changed ? "*" : "")}</span>
            </span>
            <X onClick={() => props.file.close(props)} className="small ms-1" />
        </Col>
    );
}

export default EditorTab;
