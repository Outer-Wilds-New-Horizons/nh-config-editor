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

function Editor(props: EditorProps) {
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
                        schema={props.file.getSchema()}
                        file={props.file}
                    />
                );
            }
        case "image":
            return <ImageView file={props.file} />;
        case "binary":
            return <CenteredMessage message="Can't Read Binary Files" />;
        default:
            if (
                ["json", "jsonc", "xml", "txt", "md", "yml", "yaml"].includes(props.file.extension)
            ) {
                return <TextEditor onChange={props.onChange} file={props.file} />;
            } else {
                return <CenteredMessage message="Unknown File Type" />;
            }
    }
}

export default Editor;
