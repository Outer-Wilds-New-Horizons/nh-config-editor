import {FieldProps} from "@rjsf/core";
import {useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function InspectorVector2(props: FieldProps) {

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const onUpdate = (rawVal: string, name: string) => {
        let newVal = Number.parseFloat(rawVal);
        newVal = Number.isNaN(newVal) ? 0 : newVal;
        (name === "x" ? setX : setY)(newVal);
        if (name === "x") props.onChange({x: newVal, y: y});
        else props.onChange({x: x, y: newVal});
    };

    return <Row>
        <Col>
            <Form.Control type={"number"} value={x} onChange={(e) => onUpdate(e.target.value, "x")}/>
        </Col>
        <Col>
            <Form.Control type={"number"} value={y} onChange={(e) => onUpdate(e.target.value, "y")}/>
        </Col>
    </Row>;

}

export default InspectorVector2;
