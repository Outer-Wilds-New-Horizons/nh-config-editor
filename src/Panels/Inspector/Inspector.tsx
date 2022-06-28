import Col from "react-bootstrap/Col";
import Form, {IChangeEvent} from "@rjsf/core";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";
import InspectorBoolean from "./Fields/InspectorBoolean";
import {useState} from "react";
import InspectorVector2 from "./Fields/InspectorVector2";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";

function Inspector() {

    const [formData, setFormData] = useState(null);

    let test_schema: string;

    test_schema = `{
  "$schema": "http://json-schema.org/draft-04/schema",
  "title": "Translation Schema",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "DialogueDictionary": {
      "type": "object",
      "description": "Translation table for dialogue",
      "additionalProperties": {
        "type": "string"
      }
    },
    "ShipLogDictionary": {
      "type": "object",
      "description": "Translation table for Ship Log (entries, facts, etc)",
      "additionalProperties": {
        "type": "string"
      }
    },
    "UIDictionary": {
      "type": "object",
      "description": "Translation table for UI elements",
      "additionalProperties": {
        "type": "string"
      }
    },
    "$schema": {
      "type": "string",
      "description": "The schema to validate with"
    }
  },
  "$docs": {
    "title": "Translation Schema",
    "description": "Schema for a translation file in New Horizons"
  }
}`;

    const schema = JSON.parse(test_schema);

    const customFields = {
        BooleanField: InspectorBoolean,
        vector2: InspectorVector2
    }

    const changed = (e: IChangeEvent) => {
        console.log("Changed!", e.formData);
        setFormData(e.formData);
    }

    return <Col>
        <Form formData={formData} onChange={changed} schema={schema} fields={customFields}
              ArrayFieldTemplate={InspectorArrayFieldTemplate} ObjectFieldTemplate={InspectorObjectFieldTemplate}
              FieldTemplate={InspectorFieldTemplate}/>
    </Col>;
}

export default Inspector;