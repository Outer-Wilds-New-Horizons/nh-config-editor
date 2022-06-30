import Form from "@rjsf/core";
import {invoke} from "@tauri-apps/api/tauri";
import {JSONSchema7} from "json-schema";
import {useState} from "react";
import CenteredSpinner from "../../../Common/CenteredSpinner";
import {ProjectFile} from "../../../ProjectView/ProjectFile";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";


export type InspectorProps = {
    schema: JSONSchema7,
    file: ProjectFile
}

function Inspector(props: InspectorProps) {

    const [loadStarted, setLoadStarted] = useState(false);
    const [formData, setFormData] = useState<string | null>(null);

    const loadFile = async (): Promise<string> => {
        return await invoke("read_file_as_string", {path: props.file.path});
    };

    if (!loadStarted) {
        setLoadStarted(true);
        loadFile().then((data) => setFormData(JSON.parse(data)));
    }

    if (formData === null) {
        return <CenteredSpinner animation={"border"} variant={"primary"}/>;
    }

    const customFields = {
        BooleanField: InspectorBoolean
    };

    return <Form className={"mx-3 inspector-form"} formData={formData} schema={props.schema} fields={customFields}
                 ArrayFieldTemplate={InspectorArrayFieldTemplate} ObjectFieldTemplate={InspectorObjectFieldTemplate}
                 FieldTemplate={InspectorFieldTemplate}/>;

}

export default Inspector;