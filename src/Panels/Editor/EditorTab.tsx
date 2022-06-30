import {X,} from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import {CommonProps,} from "../../App";
import {EditorProps,} from "./Editor";

export type EditorTabProps = EditorProps & CommonProps;

function EditorTab(props: EditorTabProps,) {

    let classes = "border-bottom interactable d-flex border-end align-items-center justify-content-center px-2 py-1";

    if (props.selectedFile === props.file) {
        classes += " bg-primary text-white";
    }

    const onCloseClicked = () => {

        const newFiles = props.openFiles.filter(file => file !== props.file,);

        if (newFiles.length === 0) {
            props.setSelectedFile(null,);
        } else {
            props.setSelectedFile(newFiles[0],);
        }

        props.setOpenFiles(newFiles,);

    };

    return <Col xs="auto" className={classes}>
        <span className="d-flex align-items-center justify-content-center"
              onClick={() => props.setSelectedFile(props.file,)}>
            {props.file.getIcon()}
            <span className="ms-1">{props.file.name}</span>
        </span>
        <X onClick={onCloseClicked} className="small ms-1"/>
    </Col>;
}


export default EditorTab;
