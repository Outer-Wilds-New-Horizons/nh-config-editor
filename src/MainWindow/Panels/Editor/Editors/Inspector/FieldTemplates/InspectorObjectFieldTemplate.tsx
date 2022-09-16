import type { ObjectFieldTemplateProps } from "@rjsf/core";
import { shell } from "@tauri-apps/api";
import { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { BoxArrowUpRight, CaretRightFill, InfoCircle } from "react-bootstrap-icons";

import { camelToTitleCase } from "../../../../../../Common/Utils";
import IconPopover from "../../../../../../Common/Popover/IconPopover";

const baseLink = "https://nh.outerwildsmods.com/tutorials/";

const tutorialMap: { [key: string]: string } = {
    ShipLog: `${baseLink}ship_log.html`,
    mapMode: `${baseLink}ship_log.html#map-mode-options`,
    Props: `${baseLink}details.html`,
    Orbit: `${baseLink}planet_gen.html#orbits`,
    HeightMap: `${baseLink}planet_gen.html#heightmaps`,
    FocalPoint: `${baseLink}planet_gen.html#barycenters-focal-points`,
    coords: `${baseLink}star_system.html#vessel-coordinates`
};

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
        if (!open) setOpen(true);
        if (schema.additionalProperties && schema.additionalProperties !== true) {
            onAddClick(schema)();
        }
    };

    const tutorialLink = tutorialMap[title];

    return (
        <div className={shouldRenderLabel ? `border lt-border rounded${open ? " pb-4" : ""}` : ""}>
            <div className="d-flex justify-content-between p-2">
                {shouldRenderLabel && (
                    <h2 onClick={() => setOpen(!open)} className={"interactable align-middle my-0"}>
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
                        {tutorialLink && (
                            <a
                                className="link-secondary ms-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    shell.open(tutorialLink);
                                }}
                            >
                                <BoxArrowUpRight className="fs-6" />
                            </a>
                        )}
                    </h2>
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
