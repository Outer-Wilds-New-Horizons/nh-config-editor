import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {CommonProps,} from "../../App";
import Editor from "./Editor";
import EditorTab from "./EditorTab";

function EditorFrame(props: CommonProps,) {
    if (props.selectedFile === null) {
        return <div className="d-flex h-100 user-select-none align-items-center justify-content-center">
            Select a file on the left to open it
        </div>;
    } else {
        return <>
            <Row className="border-bottom m-0 w-100">
                {props.openFiles.map(file => <EditorTab key={file.path} file={file} {...props}/>,)}
            </Row>
            <Row className="mh-100 h-100">
                {props.openFiles.map(file => (
                    <Col key={file.path}
                         className={`mh-100 h-100 overflow-y-auto${props.selectedFile === file ? "" : " d-none"}`}>
                        <Editor file={file} {...props}/>
                    </Col>
                ),)}
            </Row>
        </>;
    }
}

export default EditorFrame;
