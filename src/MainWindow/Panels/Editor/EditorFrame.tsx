import Row from "react-bootstrap/Row";
import { useAppSelector } from "../../Store/Hooks";
import { selectOpenFileIds, selectTotalOpenFiles } from "../../Store/OpenFilesSlice";
import Editor from "./Editor";
import CenteredMessage from "./Editors/CenteredMessage";
import EditorTabs from "./EditorTabs";

function EditorPanes() {
    const paths = useAppSelector((state) => selectOpenFileIds(state.openFiles)) as string[];
    return (
        <Row className="flex-grow-1 ms-0 w-100 position-relative">
            {paths.map((path) => (
                <Editor key={path} relativePath={path} />
            ))}
        </Row>
    );
}

function EditorFrame() {
    const numberOpen = useAppSelector((state) => selectTotalOpenFiles(state.openFiles));

    if (numberOpen === 0) {
        return <CenteredMessage message="Select a file on the left to edit it" />;
    } else {
        return (
            <>
                <EditorTabs />
                <EditorPanes />
            </>
        );
    }
}

export default EditorFrame;
