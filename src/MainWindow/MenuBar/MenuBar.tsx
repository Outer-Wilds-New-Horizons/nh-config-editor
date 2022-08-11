import { ReactElement } from "react";
import { MenuBarGroupProps } from "./MenuBarGroup";

export type MenuBarProps = {
    children?: ReactElement<MenuBarGroupProps>[];
    onItemClicked?: (actionId: string) => void;
};

function MenuBar(props: MenuBarProps) {
    return <div className="d-flex">{props.children}</div>;
}

export default MenuBar;
