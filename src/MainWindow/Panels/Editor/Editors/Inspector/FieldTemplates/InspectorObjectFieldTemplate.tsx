import { ObjectFieldTemplateProps } from "@rjsf/core";
import { useState } from "react";
import { Collapse } from "react-bootstrap";
import { CaretRightFill } from "react-bootstrap-icons";
import Form from "react-bootstrap/Form";

import { camelToTitleCase } from "../../../../../../Common/Utils";
import DescriptionPopover from "./DescriptionPopover";

function InspectorObjectFieldTemplate({
    title,
    description,
    properties,
    registry
}: ObjectFieldTemplateProps) {
    const shouldRenderLabel: boolean = title !== registry.rootSchema.title;

    const [open, setOpen] = useState(!shouldRenderLabel);

    return (
        <Form.Group
            className={shouldRenderLabel ? `border lt-border rounded${open ? " pb-4" : ""}` : ""}
        >
            {shouldRenderLabel && (
                <h3
                    onClick={() => setOpen(!open)}
                    className={"interactable h2 align-middle my-0 p-2"}
                >
                    <CaretRightFill className={`pb-2 pe-1 object-caret ${open ? "open" : ""}`} />
                    {camelToTitleCase(title)}
                    <DescriptionPopover id={title} title={title} description={description} />
                </h3>
            )}
            <Collapse className={shouldRenderLabel ? "mx-4" : ""} in={open}>
                <div>
                    {properties.map((e) => (
                        <div key={e.content.key}>{e.content}</div>
                    ))}
                </div>
            </Collapse>
        </Form.Group>
    );
}

export default InspectorObjectFieldTemplate;
