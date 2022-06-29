import Form from "@rjsf/core";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";
import InspectorBoolean from "./Fields/InspectorBoolean";
import {useState} from "react";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import {JSONSchema7} from "json-schema";


export type InspectorProps = {
    schema: JSONSchema7;
}

function Inspector(props: InspectorProps) {

    const [formData, setFormData] = useState(null);

    const customFields = {
        BooleanField: InspectorBoolean,
    }

    return <Form formData={formData} schema={props.schema} fields={customFields}
                 ArrayFieldTemplate={InspectorArrayFieldTemplate} ObjectFieldTemplate={InspectorObjectFieldTemplate}
                 FieldTemplate={InspectorFieldTemplate}/>;
}

export default Inspector;