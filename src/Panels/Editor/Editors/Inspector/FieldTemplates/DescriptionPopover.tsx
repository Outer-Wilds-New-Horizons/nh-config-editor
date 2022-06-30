import {Popover, PopoverBody, PopoverHeader} from "react-bootstrap";
import InfoIconTrigger from "./InfoIconTrigger";

export type DescriptionPopoverProps = {
    id: string,
    title: string,
    description: string
}

function DescriptionPopover(props: DescriptionPopoverProps) {
    const popover = <Popover id={`${props.id}-popover`}>
        <PopoverHeader>{props.title}</PopoverHeader>
        <PopoverBody>
            {props.description}
        </PopoverBody>
    </Popover>;

    return <InfoIconTrigger popover={popover}/>;
}

export default DescriptionPopover;
