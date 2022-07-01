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
    const [loadDone, setLoadDone] = useState(false);

    const loadFile = async (): Promise<string> => {
        return await invoke("read_file_as_string", {path: props.file.path});
    };

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@/")) {
            setLoadDone(true);
        } else {
            loadFile().then((data) => {
                props.file.data = JSON.parse(data);
                setLoadDone(true);
            });
        }
    }

    if (props.file.data === null || !loadDone) {
        return <CenteredSpinner animation={"border"} variant={"primary"}/>;
    }

    const customFields = {
        BooleanField: InspectorBoolean
    };

    return <Form onChange={(newData) => {
        props.file.setChanged(true);
        props.file.data = newData.formData;
    }} className={"mx-3 inspector-form"} formData={props.file.data} schema={props.schema} fields={customFields}
                 ArrayFieldTemplate={InspectorArrayFieldTemplate} ObjectFieldTemplate={InspectorObjectFieldTemplate}
                 FieldTemplate={InspectorFieldTemplate}/>;

}

export default Inspector;