import type { ArrayFieldTemplateProps } from "@rjsf/core";
import { shell } from "@tauri-apps/api";
import { cloneElement, useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { BoxArrowUpRight, CaretRightFill, InfoCircle } from "react-bootstrap-icons";
import { camelToTitleCase } from "../../../../../../Common/Utils";
import IconPopover from "../../../../../../Common/Popover/IconPopover";

const baseLink = "https://nh.outerwildsmods.com/tutorials/";

const tutorialMap: { [key: string]: string } = {
    dialogue: `${baseLink}dialogue.html`,
    entryPositions: `${baseLink}ship_log.html#entry-layout`,
    initialReveal: `${baseLink}ship_log.html#initial-reveal`,
    curiosities: `${baseLink}ship_log.html#curiosity-colors`,
    curve: `${baseLink}planet_gen.html#variable-size-modules`
};

function InspectorArrayFieldTemplate({
    canAdd,
    items,
    onAddClick,
    schema,
    title
}: ArrayFieldTemplateProps) {
    const [open, setOpen] = useState(false);

    for (let i = 0; i < items.length; i++) {
        const e = items[i];
        const str = `Item #${i + 1}`;
        e.children = cloneElement(e.children, {
            epicLabel: str,
            title: str,
            name: str
        });
    }

    const onAddClickedLocal = () => {
        if (!open) setOpen(true);
        onAddClick();
    };

    console.debug(title);
    const tutorialLink = tutorialMap[title];

    return (
        <div className="border lt-border rounded">
            <div className="d-flex justify-content-between p-2">
                <h4 className="align-middle my-0 d-inline">
                    <span className="interactable" onClick={() => setOpen(!open)}>
                        <CaretRightFill
                            className={`pb-2 pe-1 object-caret ${open ? "open" : ""}`}
                        />
                        {camelToTitleCase(title)}
                    </span>
                    {schema.description !== undefined && (
                        <IconPopover
                            icon={<InfoCircle />}
                            id={title}
                            title={title}
                            body={schema.description}
                        />
                    )}
                    {tutorialLink !== undefined && (
                        <a
                            onClick={(e) => {
                                e.stopPropagation();
                                shell.open(tutorialLink);
                            }}
                            className="link-secondary ms-2"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <BoxArrowUpRight className="fs-6" />
                        </a>
                    )}
                </h4>
                {canAdd && (
                    <Button
                        className="float-end fw-bold rounded-pill d-block my-auto py-0 px-2"
                        size="sm"
                        aria-label="Add Item"
                        onClick={onAddClickedLocal}
                        variant="outline-success"
                    >
                        Add Item
                    </Button>
                )}
            </div>

            <Collapse in={open}>
                <div className={"pb-2 mx-2"}>
                    {items.map((element, index) => (
                        <div key={element.key}>
                            {element.children}
                            <Button
                                className={"rounded-pill me-2"}
                                size={"sm"}
                                variant={"outline-danger"}
                                onClick={element.onDropIndexClick(index)}
                            >
                                Remove #{index + 1}
                            </Button>
                            {element.hasMoveUp && (
                                <Button
                                    className={"rounded-pill me-2"}
                                    size={"sm"}
                                    variant={"outline-primary"}
                                    onClick={element.onReorderClick(index, index - 1)}
                                >
                                    Move Up
                                </Button>
                            )}
                            {element.hasMoveDown && (
                                <Button
                                    className={"rounded-pill"}
                                    size={"sm"}
                                    variant={"outline-primary"}
                                    onClick={element.onReorderClick(index, index + 1)}
                                >
                                    Move Down
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

export default InspectorArrayFieldTemplate;
