import Row from "react-bootstrap/Row";
import { SchemaStore } from "../../../Common/AppData/SchemaStore";
import { useAppSelector } from "../../Store/Hooks";
import { selectOpenFileIds, selectTotalOpenFiles } from "../../Store/OpenFilesSlice";
import Editor from "./Editor";
import CenteredMessage from "./Editors/CenteredMessage";
import EditorTabs from "./EditorTabs";

type EditorFrameProps = {
    schemaStore: SchemaStore;
};

function EditorPanes(props: EditorFrameProps) {
    const paths = useAppSelector((state) => selectOpenFileIds(state.openFiles)) as string[];
    return (
        <Row className="flex-grow-1 ms-0 w-100 position-relative">
            {paths.map((path) => (
                <Editor key={path} schemaStore={props.schemaStore} relativePath={path} />
            ))}
        </Row>
    );
}

function EditorFrame(props: EditorFrameProps) {
    const numberOpen = useAppSelector((state) => selectTotalOpenFiles(state.openFiles));

    if (numberOpen === 0) {
        return <CenteredMessage message="Select a file on the left to edit it" />;
    } else {
        return (
            <>
                <EditorTabs />
                <EditorPanes {...props} />
            </>
        );
    }
}

export default EditorFrame;
