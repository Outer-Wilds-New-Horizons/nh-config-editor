import { cloneElement, ReactElement, SVGAttributes } from "react";
import { Dropdown } from "react-bootstrap";

export type IconDropDownItemProps = {
    id: string;
    label?: string;
    annotation?: string;
    icon?: ReactElement<SVGAttributes<SVGElement>>;
    onClick?: () => void;
};

function IconDropDownItem(props: IconDropDownItemProps) {
    if (props.id === "separator") {
        return <Dropdown.Divider />;
    }

    return (
        <Dropdown.Item className="d-flex align-items-center" onClick={props.onClick}>
            {props.icon && cloneElement(props.icon, { className: "fs-6" })}
            <span className={`me-4${props.icon ? " ms-2" : " ms-4"}`}>
                {props.label ?? props.id}
            </span>{" "}
            {props.annotation && <span className="text-muted ms-auto">{props.annotation}</span>}
        </Dropdown.Item>
    );
}

export default IconDropDownItem;
