import Form, { UiSchema, utils } from "@rjsf/core";
import { shell } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";
import { JSONSchema7 } from "json-schema";
import { useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import CenteredSpinner from "../../../../../Common/Spinner/CenteredSpinner";
import { IEditorProps } from "../../Editor";
import CenteredMessage from "../CenteredMessage";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";
import baseValidate, { customFormats, transformErrors } from "./Validator";

export type InspectorProps = {
    schema: JSONSchema7;
} & IEditorProps;

function Inspector(props: InspectorProps) {
    const [loadStarted, setLoadStarted] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<object | null>(null);

    const loadFile = async (): Promise<string> => {
        return await invoke("read_file_as_string", {
            path: props.file.path
        });
    };

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@")) {
            setFormData({});
            setLoadDone(true);
        } else {
            loadFile()
                .then((data) => {
                    setFormData(
                        utils.getDefaultFormState(props.schema, JSON.parse(data), props.schema)
                    );
                    setLoadDone(true);
                })
                .catch(setErrorMessage);
        }
    }

    if (formData === null || !loadDone) {
        if (errorMessage) {
            return (
                <CenteredMessage
                    variant="danger"
                    message={`Failed to load file: ${errorMessage}`}
                    after={
                        <Button
                            className="mt-2 mx-auto d-flex align-items-center"
                            onClick={() => shell.open(props.file.path)}
                            variant="outline-info"
                        >
                            <BoxArrowUpRight className="me-1" />
                            Fix In External Editor
                        </Button>
                    }
                />
            );
        } else {
            return <CenteredSpinner />;
        }
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
        setFormData(newData);
        props.onChange?.(newData);
    };

    const formContext = {
        docsSchemaLink:
            props.file.fileType === "mod_manifest" ? null : props.file.getDocsSchemaLink()
    };

    return (
        <Form
            onChange={(newData) => onChange(newData.formData)}
            className="mx-3 inspector-form"
            formData={formData}
            formContext={formContext}
            schema={{ ...props.schema, $schema: "http://json-schema.org/draft-07/schema" }}
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
