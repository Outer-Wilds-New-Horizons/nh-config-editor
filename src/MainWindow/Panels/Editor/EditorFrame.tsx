import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ProjectFile } from "../ProjectView/ProjectFile";
import Editor from "./Editor";
import CenteredMessage from "./Editors/CenteredMessage";
import EditorTab from "./EditorTab";

type EditorFrameProps = {
    openFiles: ProjectFile[];
    selectedFile: ProjectFile | null;
    onSelectFile?: (file: ProjectFile) => void;
    onCloseFile?: (file: ProjectFile) => void;
    onFileChanged?: (file: ProjectFile) => void;
    onFileContextMenu?: (index: number, position: [number, number]) => void;
};

function EditorFrame(props: EditorFrameProps) {
    if (props.selectedFile === null) {
        return <CenteredMessage message="Select a file on the left to edit it" />;
    } else {
        return (
            <>
                <Row className="border-bottom lt-border m-0">
                    {props.openFiles.map((file, index) => (
                        <EditorTab
                            active={props.selectedFile === file}
                            onSelect={() => props.onSelectFile?.(file)}
                            onClose={() => props.onCloseFile?.(file)}
                            onContextMenu={(position) => props.onFileContextMenu?.(index, position)}
                            key={file.path}
                            file={file}
                        />
                    ))}
                </Row>
                <Row className="flex-grow-1 ms-0 w-100 position-relative">
                    {props.openFiles.map((file) => (
                        <Col
                            key={file.path}
                            className={`position-absolute p-0 top-0 end-0 start-0 bottom-0 overflow-y-auto${
                                props.selectedFile === file ? "" : " d-none"
                            }`}
                        >
                            <Editor
                                onChange={() => props.onFileChanged?.(file)}
                                file={file}
                                {...props}
                            />
                        </Col>
                    ))}
                </Row>
            </>
        );
    }
}

export default EditorFrame;
