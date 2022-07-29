import { dialog } from "@tauri-apps/api";
import { useMemo } from "react";
import { X } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import { useAppDispatch, useAppSelector } from "../../../Store/Hooks";
import {
    closeTab,
    selectOpenFileByRelativePath,
    selectSelectedTabIndex,
    selectTab
} from "../../../Store/OpenFiles";
import { determineIcon } from "../../../Store/FileUtils";

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

    const onClose = () => dispatch(closeTab(props.id));

    const confirmClose = () => {
        if (file.memoryData === file.diskData) {
            onClose();
        } else {
            dialog
                .ask("Are you sure you want to close this file without saving?", {
                    type: "warning",
                    title: file.name
                })
                .then((result) => {
                    if (result) onClose();
                });
        }
    };

    const icon = useMemo(() => determineIcon(file), [props.id]);

    return (
        <Col xs="auto" className={classes}>
            <span onClick={onClick} className="d-flex align-items-center justify-content-center">
                {icon}
                <span className="ms-1">
                    {file.name + (file.memoryData !== file.diskData ? "*" : "")}
                </span>
            </span>
            <X onClick={confirmClose} className="small ms-1" />
        </Col>
    );
}

export default EditorTab;
