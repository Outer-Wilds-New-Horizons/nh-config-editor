import React, { useState } from "react";
import { X } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";

import type { Project } from "../Common/Project";

export type RecentProjectProps = {
    project: Project;
    onClick?: () => void;
    onDeleteClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
};

function RecentProject(props: RecentProjectProps) {
    const [deleteVisible, setDeleteVisible] = useState(false);

    const onDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        props.onDeleteClick?.();
    };

    return (
        <ListGroup.Item
            as="li"
            onMouseEnter={() => setDeleteVisible(true)}
            onMouseLeave={() => setDeleteVisible(false)}
            onClick={props.onClick}
            onContextMenu={props.onContextMenu}
            action
            className="interactable lt-border border-bottom text-nowrap"
        >
            <Button
                onClick={(e) => onDeleteClick(e)}
                className={`position-absolute end-0 top-0 py-1 mt-1 me-1${
                    deleteVisible ? " d-flex align-items-center" : " d-none"
                }`}
                aria-label="Delete"
                variant="outline-danger"
                size="sm"
            >
                <X />
            </Button>
            <span
                className={`user-select-none${props.project.valid ? "" : " text-muted fw-light"}`}
            >
                {props.project.name}
            </span>
            <span className="text-muted d-block text-truncate ms-2 small user-select-none">
                {props.project.path}
            </span>
        </ListGroup.Item>
    );
}

export default RecentProject;
