import { ObjectFieldTemplateProps } from "@rjsf/core";
import { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { CaretRightFill, InfoCircle } from "react-bootstrap-icons";

import { camelToTitleCase } from "../../../../../../Common/Utils";
import IconPopover from "../../../../../../Common/Popover/IconPopover";

function InspectorObjectFieldTemplate({
    title,
    description,
    properties,
    registry,
    schema,
    onAddClick
}: ObjectFieldTemplateProps) {
    const shouldRenderLabel: boolean = title !== registry.rootSchema.title;

    const [open, setOpen] = useState(!shouldRenderLabel);

    const onAddKey = () => {
        if (schema.additionalProperties && schema.additionalProperties !== true) {
            onAddClick(schema)();
        }
    };

    return (
        <div className={shouldRenderLabel ? `border lt-border rounded${open ? " pb-4" : ""}` : ""}>
            <div className="d-flex justify-content-between p-2">
                {shouldRenderLabel && (
                    <h3
                        onClick={() => setOpen(!open)}
                        className={"interactable h2 align-middle my-0"}
                    >
                        <CaretRightFill
                            className={`pb-2 pe-1 object-caret ${open ? "open" : ""}`}
                        />
                        {camelToTitleCase(title)}
                        <IconPopover
                            icon={<InfoCircle />}
                            id={title}
                            title={title}
                            body={description}
                        />
                    </h3>
                )}
                {schema.additionalProperties && (
                    <Button
                        className="float-end fw-bold d-block rounded-pill my-auto h-25 py-0 px-2"
                        size="sm"
                        aria-label="Add Item"
                        onClick={onAddKey}
                        variant="outline-success"
                    >
                        Add Key
                    </Button>
                )}
            </div>
            <Collapse className={shouldRenderLabel ? "mx-4" : ""} in={open}>
                <div>
                    {properties.map((e) => (
                        <div key={e.content.key}>{e.content}</div>
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

export default InspectorObjectFieldTemplate;
