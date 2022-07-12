import { ReactElement } from "react";
import ContextMenu, { ContextMenuProps } from "./ContextMenu";

type ContextMenuRootProps = {
    currentId: string;
    x: number;
    y: number;
    target: unknown;
    children: ReactElement<ContextMenuProps> | ReactElement<ContextMenuProps>[];
    onMenuItemClicked?: (menuId: string, actionId: string, target: unknown) => void;
};

export type ContextMenuState = {
    currentId: string;
    x: number;
    y: number;
    target: unknown;
};

export type ContextMenuActionRegistry = {
    [key: string]: { [key: string]: (target: unknown) => void };
};

function ContextMenuRoot(props: ContextMenuRootProps) {
    let children = props.children;

    if (!Array.isArray(children)) {
        children = [children];
    }

    return (
        <div className="position-absolute" style={{ top: `${props.y}px`, left: `${props.x}px` }}>
            {children.map((child, index) => (
                <ContextMenu
                    onItemClicked={(actionId) =>
                        props.onMenuItemClicked?.(props.currentId, actionId, props.target)
                    }
                    key={index}
                    show={props.currentId === child.props.id}
                    id={child.props.id}
                >
                    {child.props.children}
                </ContextMenu>
            ))}
        </div>
    );
}

export default ContextMenuRoot;
