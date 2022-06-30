import {FieldProps} from "@rjsf/core";
import hexRgb from "hex-rgb";
import {ChangeEvent, useState} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

declare type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

function InspectorColor(props: FieldProps) {

    const [currentCol, setCol] = useState("#000000");
    const [currentAlpha, setAlpha] = useState(255);

    const colChanged = (e: ChangeEvent<FormControlElement>) => {
        const newCol = e.target.value;
        setCol(newCol);
        const rgbCol = hexRgb(newCol);
        props.onChange({r: rgbCol.red, g: rgbCol.green, b: rgbCol.blue, a: currentAlpha});
    };

    const alphaChanged = (e: ChangeEvent<FormControlElement>) => {
        let newAlpha = Number.parseFloat(e.target.value);
        newAlpha = Number.isNaN(newAlpha) ? 0 : newAlpha;
        setAlpha(newAlpha);
        const rgbCol = hexRgb(currentCol);
        props.onChange({r: rgbCol.red, g: rgbCol.green, b: rgbCol.blue, a: newAlpha});
    };

    return <Row>
        <Col>
            <Form.Control className={"w-100"} onChange={colChanged} type={"color"} value={currentCol}/>
        </Col>
        <Col>
            <Form.Control min={0} max={255} onChange={alphaChanged} type={"number"} placeholder={"alpha"}
                          value={currentAlpha}/>
        </Col>
    </Row>;
}

export default InspectorColor;
