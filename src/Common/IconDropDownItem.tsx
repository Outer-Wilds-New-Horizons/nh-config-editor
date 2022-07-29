import { os } from "@tauri-apps/api";
import { cloneElement, ReactElement, SVGAttributes } from "react";
import { Dropdown } from "react-bootstrap";
import { useHotkeys } from "react-hotkeys-hook";

export type IconDropDownItemProps = {
    id: string;
    label?: string;
    annotation?: string;
    shortcut?: string;
    disabled?: boolean;
    icon?: ReactElement<SVGAttributes<SVGElement>>;
    onClick?: () => void;
};

const osType = await os.type();

const normalizeShortcut = (shortcut: string) => {
    if (osType === "Darwin") {
        shortcut = shortcut.replace("Ctrl", "⌘");
        shortcut = shortcut.replace("Alt", "⌥");
        shortcut = shortcut.replace("Shift", "⇧");
        shortcut = shortcut.replace(/\+/, "");
    }
    return shortcut;
};

function IconDropDownItem(props: IconDropDownItemProps) {
    if (props.id === "separator") {
        return <Dropdown.Divider />;
    }

    if (props.shortcut !== undefined) {
        useHotkeys(props.shortcut, (e) => {
            e.preventDefault();
            if (props.disabled !== false) {
                props.onClick?.();
            }
        });
    }

    const annotation = props.annotation ? normalizeShortcut(props.annotation) : props.annotation;

    return (
        <Dropdown.Item
            className={`d-flex user-select-none align-items-center${
                props.disabled ? " disabled" : ""
            }`}
            onClick={props.onClick}
        >
            {props.icon && cloneElement(props.icon, { className: "fs-6" })}
            <span className={`me-4${props.icon ? " ms-2" : " ms-4"}`}>
                {props.label ?? props.id}
            </span>{" "}
            {annotation && <span className="text-muted ms-auto">{annotation}</span>}
        </Dropdown.Item>
    );
}

export default IconDropDownItem;
