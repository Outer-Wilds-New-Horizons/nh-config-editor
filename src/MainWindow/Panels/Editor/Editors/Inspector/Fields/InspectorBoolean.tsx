import { FieldProps } from "@rjsf/core";
import { Form } from "react-bootstrap";

function InspectorBoolean(props: FieldProps) {
    return (
        <Form.Switch
            className={"my-2"}
            onChange={() => {
                props.onChange(!(props.formData ?? false));
            }}
            id={props.id}
            checked={props.formData ?? false}
        />
    );
}

export default InspectorBoolean;
