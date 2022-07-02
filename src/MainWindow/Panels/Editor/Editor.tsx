import {JSONSchema7} from "json-schema";
import {stripDefaultsFromJsonSchema} from "../../../Utils";

import addonManifestSchema from "../../Schemas/addon_manifest_schema.json";
import bodySchema from "../../Schemas/body_schema.json";
import modManifestSchema from "../../Schemas/mod_manifest_schema.json";
import starSystemSchema from "../../Schemas/star_system_schema.json";
import translationSchema from "../../Schemas/translation_schema.json";
import {ProjectFile} from "../ProjectView/ProjectFile";
import ImageView from "./Editors/ImageView";
import Inspector from "./Editors/Inspector/Inspector";

stripDefaultsFromJsonSchema(bodySchema as JSONSchema7);
stripDefaultsFromJsonSchema(starSystemSchema as JSONSchema7);
stripDefaultsFromJsonSchema(addonManifestSchema as JSONSchema7);
stripDefaultsFromJsonSchema(modManifestSchema as JSONSchema7);
stripDefaultsFromJsonSchema(translationSchema as JSONSchema7);

export type EditorProps = {
    file: ProjectFile
}

function Editor(props: EditorProps) {

    switch (props.file.fileType) {
        case "planet":
            return <Inspector schema={bodySchema as JSONSchema7} file={props.file}/>;
        case "system":
            return <Inspector schema={starSystemSchema as JSONSchema7} file={props.file}/>;
        case "translation":
            return <Inspector schema={translationSchema as JSONSchema7} file={props.file}/>;
        case "addon_manifest":
            return <Inspector schema={addonManifestSchema as JSONSchema7} file={props.file}/>;
        case "mod_manifest":
            return <Inspector schema={modManifestSchema as JSONSchema7} file={props.file}/>;
        case "image":
            return <ImageView file={props.file}/>;
        default:
            return <div className={"d-flex align-items-center justify-content-center h-100"}>Unknown file type</div>;
    }

}

export default Editor;
