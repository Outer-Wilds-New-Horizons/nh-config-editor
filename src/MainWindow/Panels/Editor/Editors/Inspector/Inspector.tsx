import Form, { UiSchema } from "@rjsf/core";
import { useState } from "react";
import { getDocsLinkForNHConfig, getSchemaName } from "../../../../Store/FileUtils";
import { IEditorProps } from "../../Editor";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";
import baseValidate, { customFormats, transformErrors } from "./Validator";

function Inspector(props: IEditorProps) {
    const [formData, setFormData] = useState(JSON.parse(props.fileData));

    const customFields = {
        BooleanField: InspectorBoolean
    };

    const uiSchema: UiSchema = {
        "ui:submitButtonOptions": {
            norender: true,
            submitText: "",
            props: {}
        },
        // Autocomplete happens on anything named "Name" so we want to disable it for the "Name" field.
        name: {
            autocomplete: "off"
        }
    };

    const onChange = (newData: object) => {
        setFormData(newData);
        props.onChange?.(JSON.stringify(newData));
    };

    const formContext = {
        docsSchemaLink:
            props.file.name === "manifest.json"
                ? null
                : getDocsLinkForNHConfig(getSchemaName(props.file))
    };

    return (
        <Form
            autoComplete="off"
            onChange={(newData) => onChange(newData.formData)}
            className="mx-3 inspector-form"
            formData={formData}
            formContext={formContext}
            schema={{
                ...(props.schemaStore.schemas[getSchemaName(props.file)] as object),
                $schema: "http://json-schema.org/draft-07/schema"
            }}
            uiSchema={uiSchema}
            fields={customFields}
            transformErrors={transformErrors}
            validate={baseValidate}
            customFormats={customFormats}
            liveValidate={true}
            ArrayFieldTemplate={InspectorArrayFieldTemplate}
            ObjectFieldTemplate={InspectorObjectFieldTemplate}
            FieldTemplate={InspectorFieldTemplate}
        />
    );
}

export default Inspector;
