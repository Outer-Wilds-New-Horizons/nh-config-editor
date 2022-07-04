import { ProjectFile } from "../ProjectView/ProjectFile";
import ImageView from "./Editors/ImageView";
import Inspector from "./Editors/Inspector/Inspector";

export type EditorProps = {
    file: ProjectFile;
};

function Editor(props: EditorProps) {
    switch (props.file.fileType) {
        case "planet":
        case "system":
        case "translation":
        case "addon_manifest":
        case "mod_manifest":
            return <Inspector schema={props.file.getSchema()} file={props.file} />;
        case "image":
            return <ImageView file={props.file} />;
        default:
            return (
                <div className={"d-flex align-items-center justify-content-center h-100"}>
                    Unknown file type
                </div>
            );
    }
}

export default Editor;
