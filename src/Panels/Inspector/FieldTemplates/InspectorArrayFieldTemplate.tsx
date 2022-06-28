import {ArrayFieldTemplateProps} from "@rjsf/core";
import {cloneElement, useState} from "react";
import {CaretRightFill} from "react-bootstrap-icons";
import {camelToTitleCase} from "../../../Utils";
import {Button, Collapse} from "react-bootstrap";
import DescriptionPopover from "./DescriptionPopover";


function InspectorArrayFieldTemplate(props: ArrayFieldTemplateProps) {

    const [open, setOpen] = useState(false);

    console.log(props.items);

    for (let i = 0; i < props.items.length; i++) {
        const e = props.items[i];
        const str = `Item #${i + 1}`
        e.children = cloneElement(e.children, {epicLabel: str, title: str, name: str});
    }

    return <div className={"border-bottom border-top"}>
        <div className={"d-flex justify-content-between"}>
            <h4 className={"align-middle my-0 d-inline"}>
            <span className={"object-header"} onClick={() => setOpen(!open)}>
                <CaretRightFill className={"pb-2 pe-1 object-caret " + (open ? "open" : "")}/>
                {camelToTitleCase(props.title)}
            </span>
                {props.schema.description !== undefined &&
                    <DescriptionPopover id={props.title} title={props.title} description={props.schema.description}/>
                }
            </h4>
            {props.canAdd &&
                <Button className={"float-end fw-bold rounded-pill d-block my-auto py-0 px-2"}
                        size={"sm"}
                        aria-label={"Add Item"}
                        onClick={props.onAddClick}
                        variant={"outline-success"}>Add Item</Button>
            }
        </div>

        <Collapse in={open}>
            <div className={"pb-2 ms-2"}>
                {
                    props.items.map((element, index) =>
                        <div key={element.key}>
                            {element.children}
                            <Button className={"rounded-pill me-2"} size={"sm"} variant={"outline-danger"}
                                    onClick={element.onDropIndexClick(index)}>Remove #{index + 1}</Button>
                            {element.hasMoveUp &&
                                <Button className={"rounded-pill me-2"} size={"sm"} variant={"outline-primary"}
                                        onClick={element.onReorderClick(index, index - 1)}>Move Up</Button>
                            }
                            {element.hasMoveDown &&
                                <Button className={"rounded-pill"} size={"sm"} variant={"outline-primary"}
                                        onClick={element.onReorderClick(index, index + 1)}>Move Down</Button>
                            }
                        </div>
                    )
                }
            </div>
        </Collapse>
    </div>

}

export default InspectorArrayFieldTemplate;
