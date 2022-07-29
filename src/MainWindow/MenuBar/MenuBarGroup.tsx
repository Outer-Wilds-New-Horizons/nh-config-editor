import { ReactElement } from "react";
import { Dropdown } from "react-bootstrap";
import { IconDropDownItemProps } from "../../Common/IconDropDownItem";

type MenuBarGroupItem = ReactElement<IconDropDownItemProps>;

export type MenuBarGroupProps = {
    name: string;
    children: MenuBarGroupItem | MenuBarGroupItem[];
    onItemClicked?: (actionId: string) => void;
};

function MenuBarGroup(props: MenuBarGroupProps) {
    let children = props.children;

    if (!Array.isArray(children)) {
        children = [children];
    }

    return (
        <Dropdown>
            <Dropdown.Toggle
                className="user-select-none py-0 me-3 menubar-item border-0"
                variant="light"
            >
                {props.name}
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount={true}>{children}</Dropdown.Menu>
        </Dropdown>
    );
}

export default MenuBarGroup;
