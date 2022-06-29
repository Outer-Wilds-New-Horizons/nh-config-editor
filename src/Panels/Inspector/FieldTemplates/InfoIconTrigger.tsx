import PropTypes from "prop-types";
import {InfoCircle} from "react-bootstrap-icons";
import {OverlayTrigger} from "react-bootstrap";

export type InfoIconTriggerProps = {
    popover: PropTypes.ReactElementLike
}

function InfoIconTrigger(props: InfoIconTriggerProps) {
    // noinspection RequiredAttributes
    return <OverlayTrigger delay={{show: 50, hide: 50}} trigger={["hover", "focus"]} placement={"right"}
                           overlay={props.popover}>
        <InfoCircle className={"ms-2 fs-6"} aria-label={"Info"}/>
    </OverlayTrigger>
}

export default InfoIconTrigger;
