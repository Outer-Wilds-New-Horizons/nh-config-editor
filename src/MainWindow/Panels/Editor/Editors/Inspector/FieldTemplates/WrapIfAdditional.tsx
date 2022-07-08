// Stolen from https://github.com/rjsf-team/react-jsonschema-form/blob/master/packages/bootstrap-4/src/FieldTemplate/WrapIfAdditional.tsx
// Adapted to use the new Bootstrap 5 components.

import React from "react";

import { utils } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import { Trash3 } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

const { ADDITIONAL_PROPERTY_FLAG } = utils;

export type WrapIfAdditionalProps = {
    children: React.ReactElement;
    classNames: string;
    disabled: boolean;
    id: string;
    label: string;
    onDropPropertyClick: (index: string) => () => void;
    onKeyChange: (index: string) => () => void;
    readonly: boolean;
    required: boolean;
    schema: JSONSchema7;
};

const WrapIfAdditional = ({
    children,
    disabled,
    id,
    label,
    onDropPropertyClick,
    onKeyChange,
    readonly,
    required,
    schema
}: WrapIfAdditionalProps) => {
    const additional = Object.prototype.hasOwnProperty.call(schema, ADDITIONAL_PROPERTY_FLAG);

    if (!additional) {
        return children;
    }

    const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement>) =>
        onKeyChange(target.value);

    return (
        <Row className="my-2" key={`${id}-key`}>
            <Col xs={5}>
                <Form.Group>
                    <Form.Control
                        required={required}
                        defaultValue={label}
                        disabled={disabled || readonly}
                        id={`${id}-key`}
                        name={`${id}-key`}
                        onBlur={!readonly ? handleBlur : undefined}
                        type="text"
                    />
                </Form.Group>
            </Col>
            <Col xs={6}>{children}</Col>
            <Col xs={1}>
                <Button
                    className="d-flex justify-content-center align-items-center w-100 h-100 px-1 d-block"
                    variant="outline-danger"
                    tabIndex={-1}
                    disabled={disabled || readonly}
                    onClick={onDropPropertyClick(label)}
                >
                    <Trash3 />
                </Button>
            </Col>
        </Row>
    );
};

export default WrapIfAdditional;
