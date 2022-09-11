import { ReactElement, useEffect, useMemo, useRef } from "react";
import Col from "react-bootstrap/Col";
import { connect } from "react-redux";
import CenteredSpinner from "../../../Common/Spinner/CenteredSpinner";
import { useAppDispatch, useAppSelector } from "../../Store/Hooks";
import {
    fileEdited,
    OpenFile,
    readFileData,
    selectOpenFileByRelativePath,
    selectOpenFileIsSelectedFactory,
    validateFile
} from "../../Store/OpenFilesSlice";
import { isAudio, isImage, usesInspector } from "../../Store/FileUtils";
import { RootState } from "../../Store/Store";
import { useSettings } from "../../../Wrapper";
import AudioView from "./Editors/AudioView";
import CenteredMessage from "./Editors/CenteredMessage";
import ImageView from "./Editors/ImageView";
import Inspector from "./Editors/Inspector/Inspector";
import TextEditor from "./Editors/TextEditor";

export type EditorProps = {
    relativePath: string;
    isSelected?: boolean;
};

export type IEditorProps = {
    file: OpenFile;
    fileData: string;
    onChange?: (value: string) => void;
};

const determineEditor = (
    file: OpenFile,
    alwaysUseTextEditor: boolean
): ((props: IEditorProps) => ReactElement) => {
    let ChosenEditor = TextEditor;
    if (isImage(file)) {
        ChosenEditor = ImageView;
    } else if (isAudio(file)) {
        ChosenEditor = AudioView;
    } else if (usesInspector(file) && !alwaysUseTextEditor) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ChosenEditor = Inspector;
    }
    return ChosenEditor;
};

function Editor(props: EditorProps) {
    const { alwaysUseTextEditor } = useSettings();
    const dispatch = useAppDispatch();
    const currentValidationPromise = useRef<{ abort: () => void } | null>(null);

    const file = useAppSelector((state: RootState) =>
        selectOpenFileByRelativePath(state.openFiles, props.relativePath)
    )!;

    if (["exe", "dll", "zip"].includes(file.extension.toLowerCase())) {
        return (
            <CenteredMessage
                message="Can't Read Binary Files"
                variant="danger"
                className={props.isSelected ? "" : "d-none"}
            />
        );
    }

    useEffect(() => {
        if (file.loadState.status === "idle") {
            dispatch(readFileData(file));
        }
    }, [file.loadState.status, dispatch]);

    const onDataChanged = (value: string) => {
        dispatch(fileEdited({ id: file.relativePath, content: value }));
        currentValidationPromise.current?.abort();
        currentValidationPromise.current = dispatch(validateFile({ value, file }));
    };

    const ChosenEditor = useMemo(
        () => determineEditor(file, alwaysUseTextEditor),
        [props.relativePath, alwaysUseTextEditor]
    );

    switch (file.loadState.status) {
        case "idle":
        case "loading":
            return <CenteredSpinner />;
        case "error":
            return (
                <CenteredMessage
                    message={`Error: ${file.loadState.error}`}
                    variant="danger"
                    className={props.isSelected ? "" : "d-none"}
                />
            );
        case "done":
            return (
                <Col
                    className={`position-absolute p-0 top-0 end-0 start-0 bottom-0 overflow-y-auto${
                        props.isSelected ? "" : " d-none"
                    }`}
                >
                    <ChosenEditor
                        onChange={onDataChanged}
                        file={file}
                        fileData={file.memoryData!}
                    />
                </Col>
            );
    }
}

const mapStateToProps = () => {
    const selectOpenFileIsSelected = selectOpenFileIsSelectedFactory();

    return (state: RootState, ownProps: EditorProps) => {
        return { isSelected: selectOpenFileIsSelected(state.openFiles, ownProps.relativePath) };
    };
};

export default connect(mapStateToProps)(Editor);
