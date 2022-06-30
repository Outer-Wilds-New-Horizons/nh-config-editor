import {JSONSchema7} from "json-schema";
import addon_manifest_schema from "../../Schemas/addon_manifest_schema.json";

import body_schema from "../../Schemas/body_schema.json";
import mod_manifest_schema from "../../Schemas/mod_manifest_schema.json";
import star_system_schema from "../../Schemas/star_system_schema.json";
import translation_schema from "../../Schemas/translation_schema.json";
import {ProjectFile} from "../ProjectView/ProjectFile";
import ImageView from "./Editors/ImageView";
import Inspector from "./Editors/Inspector/Inspector";

export type EditorProps = {
    file: ProjectFile
}

function Editor(props: EditorProps) {

    switch (props.file.fileType) {
        case "planet":
            return <Inspector schema={body_schema as JSONSchema7} file={props.file}/>;
        case "system":
            return <Inspector schema={star_system_schema as JSONSchema7} file={props.file}/>;
        case "translation":
            return <Inspector schema={translation_schema as JSONSchema7} file={props.file}/>;
        case "addon_manifest":
            return <Inspector schema={addon_manifest_schema as JSONSchema7} file={props.file}/>;
        case "mod_manifest":
            return <Inspector schema={mod_manifest_schema as JSONSchema7} file={props.file}/>;
        case "image":
            return <ImageView file={props.file}/>;
        default:
            return <div className={"d-flex align-items-center justify-content-center h-100"}>Unknown file type</div>;
    }

}

export default Editor;
