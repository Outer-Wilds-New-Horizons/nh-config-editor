import { cloneElement, ReactElement } from "react";
import { Dropdown } from "react-bootstrap";
import { IconDropDownItemProps } from "../IconDropDownItem";

export type ContextMenuProps = {
    id: string;
    children: ReactElement<IconDropDownItemProps> | ReactElement<IconDropDownItemProps>[];
    show?: boolean;
    onItemClicked?: (actionId: string) => void;
};

function ContextMenu(props: ContextMenuProps) {
    let children = props.children;

    if (!Array.isArray(children)) {
        children = [children];
    }

    return (
        <Dropdown.Menu
            show={props.show ?? false}
            id={props.id}
            popperConfig={{ strategy: "absolute" }}
        >
            {children.map((child, index) =>
                cloneElement(child, {
                    key: index,
                    onClick: () => props.onItemClicked?.(child.props.id)
                })
            )}
        </Dropdown.Menu>
    );
}

export default ContextMenu;
