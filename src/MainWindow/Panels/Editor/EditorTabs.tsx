import { useRef, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Sortable from "sortablejs";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import { selectTabs, setTabs } from "../../Store/OpenFilesSlice";
import EditorTab from "./EditorTab";

function EditorTabs() {
    const dispatch = useAppDispatch();

    const ids = useAppSelector((state) => selectTabs(state.openFiles)) as string[];
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        Sortable.create(ref.current!, {
            group: "tabs",
            animation: 150,
            direction: "horizontal",
            swapThreshold: 0.6,
            invertSwap: true,
            dataIdAttr: "data-relpath",
            store: {
                set: (sortable) => {
                    dispatch(setTabs(sortable.toArray()));
                },
                get: () => ids
            }
        });
    });

    return (
        <Row ref={ref} className="border-bottom lt-border m-0 editor-tabs">
            {ids.map((id) => (
                <EditorTab key={id} id={id} />
            ))}
        </Row>
    );
}

export default EditorTabs;
