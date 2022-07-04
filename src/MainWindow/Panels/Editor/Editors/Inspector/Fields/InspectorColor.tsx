import { FieldProps } from "@rjsf/core";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function InspectorColor(props: FieldProps) {
    const [r, setCurrentRed] = useState(props.formData?.r ?? 0);
    const [g, setCurrentGreen] = useState(props.formData?.g ?? 0);
    const [b, setCurrentBlue] = useState(props.formData?.b ?? 0);
    const [a, setAlpha] = useState(props.formData?.a ?? 255);

    const onUpdate = (rawVal: string, name: string) => {
        let newVal = Number.parseFloat(rawVal);
        newVal = Number.isNaN(newVal) ? 0 : newVal;
        if (name === "r") {
            setCurrentRed(newVal);
            props.onChange({ r: newVal, g, b, a });
        } else if (name === "g") {
            setCurrentGreen(newVal);
            props.onChange({ r, g: newVal, b, a });
        } else if (name === "b") {
            setCurrentBlue(newVal);
            props.onChange({ r, g, b: newVal, a });
        } else {
            setAlpha(newVal);
            props.onChange({ r, g, b, a: newVal });
        }
    };

    return (
        <Row className="gx-1">
            <Col>
                <Form.Control
                    type={"number"}
                    value={r}
                    onChange={(e) => onUpdate(e.target.value, "r")}
                />
            </Col>
            <Col>
                <Form.Control
                    type={"number"}
                    value={g}
                    onChange={(e) => onUpdate(e.target.value, "g")}
                />
            </Col>
            <Col>
                <Form.Control
                    type={"number"}
                    value={b}
                    onChange={(e) => onUpdate(e.target.value, "b")}
                />
            </Col>
            <Col>
                <Form.Control
                    type={"number"}
                    value={a}
                    onChange={(e) => onUpdate(e.target.value, "a")}
                />
            </Col>
        </Row>
    );
}

export default InspectorColor;
