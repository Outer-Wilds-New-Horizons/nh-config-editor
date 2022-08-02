import { useMemo } from "react";
import { X } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import { contextMenu } from "../../Store/ContextMenuSlice";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import {
    closeTab,
    selectOpenFileByRelativePath,
    selectSelectedTabIndex,
    selectTab
} from "../../Store/OpenFilesSlice";
import { determineIcon } from "../../Store/FileUtils";

export type EditorTabProps = {
    id: string;
};

function EditorTab(props: EditorTabProps) {
    const dispatch = useAppDispatch();

    const file = useAppSelector((state) =>
        selectOpenFileByRelativePath(state.openFiles, props.id)
    )!;

    let classes =
        "editor-tab lt-border interactable d-flex align-items-center justify-content-center px-2 py-1";

    const selectedIndex = useAppSelector((state) => selectSelectedTabIndex(state.openFiles));

    if (file.tabIndex === selectedIndex) {
        classes += " bg-primary text-white";
    }

    const onClick = () => dispatch(selectTab(props.id));

    const onClose = () => dispatch(closeTab(file));

    const onContext = (e: { clientX: number; clientY: number }) =>
        dispatch(
            contextMenu.openMenu({
                position: [e.clientX, e.clientY],
                target: props.id,
                menu: "openFile"
            })
        );

    const icon = useMemo(() => determineIcon(file), [props.id]);

    return (
        <Col data-relpath={props.id} onContextMenu={onContext} xs="auto" className={classes}>
            <span onClick={onClick} className="d-flex align-items-center justify-content-center">
                {icon}
                <span className="ms-1">
                    {file.name + (file.memoryData !== file.diskData ? "*" : "")}
                </span>
            </span>
            <X onClick={onClose} className="small ms-1" />
        </Col>
    );
}

export default EditorTab;
