import Row from "react-bootstrap/Row";
import { useAppSelector } from "../../Store/Hooks";
import { selectTabs } from "../../Store/OpenFilesSlice";
import EditorTab from "./EditorTab";

function EditorTabs() {
    const ids = useAppSelector((state) => selectTabs(state.openFiles)) as string[];

    return (
        <Row className="border-bottom lt-border m-0">
            {ids.map((id) => (
                <EditorTab key={id} id={id} />
            ))}
        </Row>
    );
}

export default EditorTabs;
