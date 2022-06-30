import {FieldTemplateProps} from "@rjsf/core";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {camelToTitleCase} from "../../../../../Utils";
import InspectorColor from "../Fields/InspectorColor";
import InspectorVector2 from "../Fields/InspectorVector2";
import InspectorVector3 from "../Fields/InspectorVector3";
import DescriptionPopover from "./DescriptionPopover";


function InspectorFieldTemplate(props: FieldTemplateProps) {

    if (props.label != undefined && props.label.startsWith("$")) return <></>;

    const colClass: string = props.schema.type !== "object" && props.schema.type !== "array" ? "offset-6" : "";

    const schemaKeys = JSON.stringify(props.schema.properties == undefined ? [] : Object.keys(props.schema.properties));

    const vector2 = schemaKeys === JSON.stringify(["x", "y"]);
    const vector3 = schemaKeys === JSON.stringify(["x", "y", "z"]) && props.label !== "coords";
    const color = schemaKeys === JSON.stringify(["r", "g", "b", "a"]);

    const shouldDisplayLabel: boolean = props.displayLabel || vector2 || vector3 || color || props.schema.type == "boolean";

    let elem = props.children;

    if (vector2) {
        elem = <InspectorVector2 onChange={props.onChange} {...props.children.props}/>;
    } else if (vector3) {
        elem = <InspectorVector3 onChange={props.onChange} {...props.children.props}/>;
    } else if (color) {
        elem = <InspectorColor onChange={props.onChange} {...props.children.props}/>;
    }

    if (props.label == "") {
        console.log("EPIC LABEL!!!!");
    }

    return <Form.Group as={Row} className={props.classNames + " my-2 align-items-center"}>
        {shouldDisplayLabel && <>
            <Col>
                <Form.Label className={"mb-0 h-100 user-select-none"}
                            htmlFor={props.id}>{camelToTitleCase(props.label)}</Form.Label>
                {props.rawDescription === undefined || props.rawDescription !== "" &&
                    <DescriptionPopover id={props.id} title={props.label} description={props.rawDescription}/>
                }
            </Col>
            <Col>{elem}</Col>
        </>}
        {!shouldDisplayLabel && <Col className={colClass}>
            {props.children}
        </Col>}
    </Form.Group>
}

export default InspectorFieldTemplate;
