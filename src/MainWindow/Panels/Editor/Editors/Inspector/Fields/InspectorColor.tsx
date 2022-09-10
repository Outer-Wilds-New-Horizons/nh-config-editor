import { FieldProps } from "@rjsf/core";
import { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { ChromePicker } from "react-color";
import { Checkboard } from "react-color/lib/components/common";
import { ThemeMonacoMap } from "../../../../../../Common/Theme/ThemeManager";
import { useSettings } from "../../../../../../Wrapper";

function InspectorColor(props: FieldProps) {
    const { theme } = useSettings();
    const [showPicker, setShowPicker] = useState(false);

    const currentColor = { ...props.formData, a: props.formData.a / 255 };

    const picker = (
        <Popover>
            <Popover.Body className="p-2">
                <ChromePicker
                    className="color-picker"
                    color={currentColor}
                    onChange={(c) => {
                        if (
                            c.rgb.r !== undefined &&
                            c.rgb.g !== undefined &&
                            c.rgb.b !== undefined &&
                            c.rgb.a !== undefined
                        ) {
                            props.onChange({ ...c.rgb, a: c.rgb.a! * 255 });
                        }
                    }}
                />
            </Popover.Body>
        </Popover>
    );

    const boardColors = ThemeMonacoMap[theme] === "vs" ? ["#fff", "#aaa"] : ["#111", "#222"];

    return (
        <OverlayTrigger
            rootClose
            trigger="click"
            onToggle={(nextShow) => setShowPicker(nextShow)}
            placement="auto"
            show={showPicker}
            overlay={picker}
        >
            <Button className="w-100 position-relative py-3 border-0">
                <Checkboard white={boardColors[0]} grey={boardColors[1]} />
                <div
                    className="position-absolute top-0 start-0 end-0 bottom-0"
                    style={{
                        backgroundColor: `rgba(${props.formData.r}, ${props.formData.g}, ${
                            props.formData.b
                        }, ${props.formData.a / 255})`
                    }}
                />
            </Button>
        </OverlayTrigger>
    );
}

export default InspectorColor;
