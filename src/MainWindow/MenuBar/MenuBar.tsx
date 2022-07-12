import { ReactElement } from "react";
import { KeyboardShortcutMapping } from "../../Common/KeyboardManager";
import MenuBarGroup, { MenuBarGroupProps } from "./MenuBarGroup";

export type MenuBarProps = {
    keyboardShortcuts?: KeyboardShortcutMapping;
    children?: ReactElement<MenuBarGroupProps>[];
    onItemClicked?: (actionId: string) => void;
};

function MenuBar(props: MenuBarProps) {
    return (
        <div className="d-flex">
            {props.children?.map((group, index) => (
                <MenuBarGroup
                    keyBoardShortcuts={props.keyboardShortcuts}
                    key={index}
                    {...group.props}
                    onItemClicked={props.onItemClicked}
                />
            ))}
        </div>
    );
}

export default MenuBar;
