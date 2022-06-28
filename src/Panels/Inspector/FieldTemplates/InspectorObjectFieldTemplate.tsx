import {ObjectFieldTemplateProps} from "@rjsf/core";
import Form from "react-bootstrap/Form";
import {useState} from "react";
import {Collapse} from "react-bootstrap";
import {CaretRightFill} from "react-bootstrap-icons";

import "../inspector.css";
import {camelToTitleCase} from "../../../Utils";
import DescriptionPopover from "./DescriptionPopover";


function InspectorObjectFieldTemplate({title, description, properties, registry}: ObjectFieldTemplateProps) {

    const shouldRenderLabel: boolean = title != registry.rootSchema.title;

    const [open, setOpen] = useState(!shouldRenderLabel);

    return <Form.Group className={"border-top border-bottom "}>
        {shouldRenderLabel &&
            <h3 onClick={() => setOpen(!open)} className={"object-header h2 align-middle my-0 pb-1"}>
                <CaretRightFill className={"pb-2 pe-1 object-caret " + (open ? "open" : "")}/>
                {camelToTitleCase(title)}
                <DescriptionPopover id={title} title={title} description={description}/>
            </h3>
        }
        <Collapse className={shouldRenderLabel ? "ms-4" : ""} in={open}>
            <div>
                {
                    properties.map(e => (
                        <div key={e.content.key}>{e.content}</div>
                    ))
                }
            </div>
        </Collapse>
    </Form.Group>
}

export default InspectorObjectFieldTemplate;