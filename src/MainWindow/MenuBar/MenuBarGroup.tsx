import { ReactElement } from "react";
import { Dropdown } from "react-bootstrap";
import IconDropDownItem, { IconDropDownItemProps } from "../../Common/IconDropDownItem";
import { KeyboardShortcutMapping } from "../../Common/KeyboardManager";

type MenuBarGroupItem = ReactElement<IconDropDownItemProps>;

export type MenuBarGroupProps = {
    name: string;
    children: MenuBarGroupItem | MenuBarGroupItem[];
    keyBoardShortcuts?: KeyboardShortcutMapping;
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
            <Dropdown.Menu>
                {children.map((child, index) => (
                    <IconDropDownItem
                        key={index}
                        {...child.props}
                        onClick={() => props.onItemClicked?.(child.props.id)}
                        annotation={
                            props.keyBoardShortcuts?.[child.props.id]?.replace(
                                "CommandOrControl",
                                "Ctrl"
                            ) ?? ""
                        }
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default MenuBarGroup;
