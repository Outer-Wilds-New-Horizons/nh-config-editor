import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { CommonProps } from "../../MainWindow";
import Editor from "./Editor";
import EditorTab from "./EditorTab";

function EditorFrame(props: CommonProps) {
    if (props.selectedFile === null) {
        return (
            <div className="flex-grow-1 d-flex user-select-none align-items-center justify-content-center">
                Select a file on the left to open it
            </div>
        );
    } else {
        return (
            <>
                <Row className="border-bottom lt-border m-0">
                    {props.openFiles.map((file) => (
                        <EditorTab key={file.path} file={file} {...props} />
                    ))}
                </Row>
                <Row className="flex-grow-1 w-100 position-relative">
                    {props.openFiles.map((file) => (
                        <Col
                            key={file.path}
                            className={`px-3 ms-2 position-absolute top-0 end-0 start-0 bottom-0 overflow-y-auto${
                                props.selectedFile === file ? "" : " d-none"
                            }`}
                        >
                            <Editor file={file} {...props} />
                        </Col>
                    ))}
                </Row>
            </>
        );
    }
}

export default EditorFrame;
