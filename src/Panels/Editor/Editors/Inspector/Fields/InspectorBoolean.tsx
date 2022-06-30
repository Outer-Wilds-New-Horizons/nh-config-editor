import {FieldProps} from "@rjsf/core";
import {useState} from "react";
import {Form} from "react-bootstrap";

function InspectorBoolean(props: FieldProps) {
    const [checked, setChecked] = useState((props.schema.default ?? false) as boolean);
    return <Form.Switch className={"my-2"} onChange={() => {
        setChecked(!checked);
        props.onChange(!checked)
    }} id={props.id} checked={checked}/>
}

export default InspectorBoolean;
