import { MutableRefObject, ReactNode, useState } from "react";
import { Dropdown } from "react-bootstrap";
import {
    ArrowLeft,
    ArrowLeftRight,
    ArrowRepeat,
    ArrowRight,
    BoxArrowUpRight,
    ClipboardFill,
    Trash3Fill
} from "react-bootstrap-icons";

export type ContextMenuItem = { id: string; label: string; icon?: ReactNode } | "separator";

export type ContextRegistry = { [key: string]: ContextMenuItem[] };

const ContextMenuRegistry: ContextRegistry = {
    file: [
        { id: "open_in_default", label: "Open in Default Editor", icon: <BoxArrowUpRight /> },
        { id: "copy_path", label: "Copy Path", icon: <ClipboardFill /> },
        { id: "delete_file", label: "Delete", icon: <Trash3Fill /> }
    ],
    editorTab: [
        { id: "close_right", label: "Close Tabs To The Right", icon: <ArrowRight /> },
        { id: "close_left", label: "Close Tabs To The Left", icon: <ArrowLeft /> },
        { id: "close_other_tabs", label: "Close Other Tabs", icon: <ArrowLeftRight /> }
    ],
    recentProject: [
        { id: "reload_project", label: "Reload", icon: <ArrowRepeat /> },
        { id: "open_in_explorer", label: "Show In Explorer", icon: <BoxArrowUpRight /> }
    ]
};

export const ContextActionRegistry: { [key: string]: (payload: unknown) => void } = {};

export type OpenMenu = MutableRefObject<
    (id: string, x: number, y: number, header?: string, data?: unknown) => void
>;

function ContextMenu(props: { openMenu: OpenMenu; closeMenu: MutableRefObject<() => void> }) {
    const [id, setId] = useState<string | undefined>(undefined);
    const [header, setHeader] = useState<string | undefined>(undefined);
    const [data, setData] = useState<unknown | null>(null);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    props.openMenu.current = (newId: string, newX, newY, newHeader?: string, newData?: unknown) => {
        setData(newData);
        setId(newId);
        setX(newX);
        setY(newY);
        setHeader(newHeader);
    };

    props.closeMenu.current = () => {
        setId(undefined);
        setHeader(undefined);
        setData(null);
    };

    const onItemClicked = (actionId: string) => {
        ContextActionRegistry[actionId](data);
        props.closeMenu.current();
    };

    return (
        <div className="position-absolute" style={{ top: `${y}px`, left: `${x}px` }}>
            <Dropdown.Menu
                show={id !== undefined}
                className="position-absolute top-0"
                popperConfig={{ strategy: "absolute" }}
            >
                {header && (
                    <>
                        <Dropdown.Header className="py-0 text-muted user-select-none">
                            {header}
                        </Dropdown.Header>
                        <Dropdown.Divider className="my-1 text-muted" />
                    </>
                )}
                {id &&
                    ContextMenuRegistry[id].map((item) => {
                        if (item === "separator") {
                            return <Dropdown.Divider />;
                        } else {
                            return (
                                <Dropdown.Item
                                    className="d-flex align-items-center"
                                    key={item.id}
                                    onClick={() => onItemClicked(item.id)}
                                >
                                    {item.icon && item.icon}{" "}
                                    <span className="ps-2">{item.label}</span>
                                </Dropdown.Item>
                            );
                        }
                    })}
            </Dropdown.Menu>
        </div>
    );
}

export default ContextMenu;
