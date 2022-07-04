import PropTypes from "prop-types";
import { useRef } from "react";
import { OverlayTrigger } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";

export type InfoIconTriggerProps = {
    popover: PropTypes.ReactElementLike;
};

function InfoIconTrigger(props: InfoIconTriggerProps) {
    // noinspection RequiredAttributes
    return (
        <OverlayTrigger
            delay={{ show: 50, hide: 50 }}
            trigger={["hover", "focus"]}
            placement={"right"}
            overlay={props.popover}
        >
            <InfoCircle className="ms-2 fs-6 text-secondary" aria-label="Info" />
        </OverlayTrigger>
    );
}

export default InfoIconTrigger;
