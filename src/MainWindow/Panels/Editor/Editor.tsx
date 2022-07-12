import { SchemaStore } from "../../../Common/AppData/SchemaStore";
import { useSettings } from "../../../Wrapper";
import { ProjectFile } from "../ProjectView/ProjectFile";
import CenteredMessage from "./Editors/CenteredMessage";
import ImageView from "./Editors/ImageView";
import Inspector from "./Editors/Inspector/Inspector";
import TextEditor from "./Editors/TextEditor";

export type EditorProps = {
    file: ProjectFile;
    onChange?: () => void;
};

function Editor(props: EditorProps & { schemaStore: SchemaStore }) {
    const { alwaysUseTextEditor } = useSettings();

    switch (props.file.fileType) {
        case "planet":
        case "system":
        case "translation":
        case "addon_manifest":
        case "mod_manifest":
            if (alwaysUseTextEditor) {
                return <TextEditor onChange={props.onChange} file={props.file} />;
            } else {
                return (
                    <Inspector
                        onChange={props.onChange}
                        schema={props.schemaStore.schemas[props.file.fileType]}
                        file={props.file}
                    />
                );
            }
        case "image":
            return <ImageView file={props.file} />;
        case "binary":
            return <CenteredMessage message="Can't Read Binary Files" />;
        default:
            return <TextEditor onChange={props.onChange} file={props.file} />;
    }
}

export default Editor;
