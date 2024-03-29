import { Placement } from "@popperjs/core";
import { cloneElement } from "react";
import { OverlayTrigger } from "react-bootstrap";

export type InfoIconTriggerProps = {
    popover: JSX.Element;
    icon: JSX.Element;
    ariaLabel: string;
    className?: string;
    placement?: Placement;
};

function IconPopoverTrigger(props: InfoIconTriggerProps) {
    // noinspection RequiredAttributes
    return (
        <OverlayTrigger
            delay={{ show: 50, hide: 50 }}
            trigger={["hover", "focus"]}
            placement={props.placement ?? "right"}
            overlay={props.popover}
        >
            {cloneElement(props.icon, {
                className: `ms-2 fs-6 text-secondary${
                    props.className ? ` ${props.className}` : ""
                }`,
                "aria-label": props.ariaLabel
            })}
        </OverlayTrigger>
    );
}

export default IconPopoverTrigger;
