import Form, { UiSchema, utils } from "@rjsf/core";
import { invoke } from "@tauri-apps/api/tauri";
import { JSONSchema7 } from "json-schema";
import { useState } from "react";
import CenteredSpinner from "../../../../../Common/Spinner/CenteredSpinner";
import { ProjectFile } from "../../../ProjectView/ProjectFile";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";

export type InspectorProps = {
    schema: JSONSchema7;
    file: ProjectFile;
};

function Inspector(props: InspectorProps) {
    const [loadStarted, setLoadStarted] = useState(false);
    const [loadDone, setLoadDone] = useState(false);

    const loadFile = async (): Promise<string> => {
        return await invoke("read_file_as_string", { path: props.file.path });
    };

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@/")) {
            setLoadDone(true);
        } else {
            loadFile().then((data) => {
                props.file.data = utils.getDefaultFormState(
                    props.file.getSchema(),
                    JSON.parse(data),
                    props.file.getSchema()
                );
                setLoadDone(true);
            });
        }
    }

    if (props.file.data === null || !loadDone) {
        return <CenteredSpinner />;
    }

    const customFields = {
        BooleanField: InspectorBoolean
    };

    const uiSchema: UiSchema = {
        "ui:submitButtonOptions": {
            norender: true,
            submitText: "",
            props: {}
        }
    };

    const onChange = (newData: object) => {
        props.file.setChanged(true);
        props.file.data = newData;
    };

    const formContext = {
        docsSchemaLink:
            props.file.fileType === "mod_manifest" ? null : props.file.getDocsSchemaLink()
    };

    return (
        <Form
            onChange={(newData) => onChange(newData.formData)}
            className={"mx-3 inspector-form"}
            formData={props.file.data}
            formContext={formContext}
            schema={props.schema}
            uiSchema={uiSchema}
            fields={customFields}
            ArrayFieldTemplate={InspectorArrayFieldTemplate}
            ObjectFieldTemplate={InspectorObjectFieldTemplate}
            FieldTemplate={InspectorFieldTemplate}
        />
    );
}

export default Inspector;
