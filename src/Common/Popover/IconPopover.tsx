import { Placement } from "@popperjs/core";
import { Popover, PopoverBody, PopoverHeader } from "react-bootstrap";
import IconPopoverTrigger from "./IconPopoverTrigger";

export type DescriptionPopoverProps = {
    id: string;
    title: string;
    body: string;
    icon: JSX.Element;
    className?: string;
    placement?: Placement;
};

function IconPopover(props: DescriptionPopoverProps) {
    const popover = (
        <Popover className="position-absolute" id={`${props.id}-popover`}>
            <PopoverHeader>{props.title}</PopoverHeader>
            <PopoverBody>{props.body}</PopoverBody>
        </Popover>
    );

    return (
        <IconPopoverTrigger
            className={props.className}
            popover={popover}
            icon={props.icon}
            placement={props.placement}
            ariaLabel="Info"
        />
    );
}

export default IconPopover;
