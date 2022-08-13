import Form, { UiSchema } from "@rjsf/core";
import { useState } from "react";
import { getDocsLinkForNHConfig, getSchemaName } from "../../../../Store/FileUtils";
import { useAppDispatch } from "../../../../Store/Hooks";
import { setOtherErrors } from "../../../../Store/OpenFilesSlice";
import { IEditorProps } from "../../Editor";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";
import {
    customFormats,
    transformErrors,
    validationErrorsToErrorSchema
} from "./InspectorValidation";

function Inspector(props: IEditorProps) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState(JSON.parse(props.fileData));

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
        setFormData(newData);
        props.onChange?.(JSON.stringify(newData, null, 4));
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
            onError={(e) => {
                // Why is e set as any??????
                // Docs say it's an array of errors so...?
                dispatch(
                    setOtherErrors({
                        id: props.file.relativePath,
                        otherErrors: (e as string[]).length > 0
                    })
                );
            }}
            className="mx-3 inspector-form"
            formData={formData}
            formContext={formContext}
            schema={{
                ...(props.schemaStore.schemas[getSchemaName(props.file)] as object),
                $schema: "http://json-schema.org/draft-07/schema"
            }}
            uiSchema={uiSchema}
            extraErrors={validationErrorsToErrorSchema(props.file.errors)}
            fields={customFields}
            transformErrors={(e) => {
                const errors = transformErrors(e);
                if (props.file.otherErrors !== errors.length > 0) {
                    dispatch(
                        setOtherErrors({
                            id: props.file.relativePath,
                            otherErrors: errors.length > 0
                        })
                    );
                }
                return errors;
            }}
            customFormats={customFormats}
            liveValidate={true}
            ArrayFieldTemplate={InspectorArrayFieldTemplate}
            ObjectFieldTemplate={InspectorObjectFieldTemplate}
            FieldTemplate={InspectorFieldTemplate}
        />
    );
}

export default Inspector;
