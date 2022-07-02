import {FieldProps} from "@rjsf/core";
import {useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function InspectorVector3(props: FieldProps) {

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [z, setZ] = useState(0);

    const onUpdate = (rawVal: string, name: string) => {
        let newVal = Number.parseFloat(rawVal);
        newVal = Number.isNaN(newVal) ? 0 : newVal;
        if (name === "x") {
            setX(newVal);
            props.onChange({x: newVal, y, z});
        } else if (name === "y") {
            setY(newVal);
            props.onChange({x, y: newVal, z});
        } else {
            setZ(newVal);
            props.onChange({x, y, z: newVal});
        }
    };

    return <Row>
        <Col>
            <Form.Control type={"number"} value={x} onChange={(e) => onUpdate(e.target.value, "x")}/>
        </Col>
        <Col>
            <Form.Control type={"number"} value={y} onChange={(e) => onUpdate(e.target.value, "y")}/>
        </Col>
        <Col>
            <Form.Control type={"number"} value={z} onChange={(e) => onUpdate(e.target.value, "z")}/>
        </Col>
    </Row>;

}

export default InspectorVector3;
