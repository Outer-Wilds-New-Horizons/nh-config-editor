import { FieldTemplateProps } from "@rjsf/core";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { camelToTitleCase } from "../../../../../../Common/Utils";
import InspectorColor from "../Fields/InspectorColor";
import InspectorVector2 from "../Fields/InspectorVector2";
import InspectorVector3 from "../Fields/InspectorVector3";
import DescriptionPopover from "./DescriptionPopover";
import DocsLink from "./DocsLink";

function InspectorFieldTemplate(props: FieldTemplateProps) {
    if (props.label !== undefined && props.label.startsWith("$")) return <></>;

    const colClass: string =
        props.schema.type !== "object" && props.schema.type !== "array" ? "offset-6" : "";

    const schemaKeys = JSON.stringify(
        props.schema.properties === undefined ? [] : Object.keys(props.schema.properties)
    );

    const vector2 = schemaKeys === JSON.stringify(["x", "y"]);
    const vector3 = schemaKeys === JSON.stringify(["x", "y", "z"]) && props.label !== "coords";
    const color = schemaKeys === JSON.stringify(["r", "g", "b", "a"]);

    const shouldDisplayLabel: boolean =
        props.displayLabel || vector2 || vector3 || color || props.schema.type === "boolean";

    let elem = props.children;

    if (vector2) {
        elem = (
            <InspectorVector2
                formData={props.formData}
                onChange={props.onChange}
                {...props.children.props}
            />
        );
    } else if (vector3) {
        elem = (
            <InspectorVector3
                formData={props.formData}
                onChange={props.onChange}
                {...props.children.props}
            />
        );
    } else if (color) {
        elem = (
            <InspectorColor
                formData={props.formData}
                onChange={props.onChange}
                {...props.children.props}
            />
        );
    }

    return (
        <Row className={`${props.classNames} my-2`}>
            {shouldDisplayLabel && (
                <>
                    <Col className="d-flex align-items-center">
                        <Form.Label className="mb-0 user-select-none" htmlFor={props.id}>
                            {camelToTitleCase(props.label)}
                        </Form.Label>
                        {props.rawDescription === undefined ||
                            (props.rawDescription !== "" && (
                                <DescriptionPopover
                                    id={props.id}
                                    title={props.label}
                                    description={props.rawDescription}
                                />
                            ))}
                        {props.formContext?.docsSchemaLink && (
                            <DocsLink id={props.id} docsSchema={props.formContext.docsSchemaLink} />
                        )}
                    </Col>
                    <Col>{elem}</Col>
                </>
            )}
            {!shouldDisplayLabel && <Col className={colClass}>{props.children}</Col>}
        </Row>
    );
}

export default InspectorFieldTemplate;
