import {Circle, Layer, Stage} from "react-konva";
import 'bootstrap/dist/css/bootstrap.min.css';

import Col from "react-bootstrap/Col";

function SolarView() {

    const virtualSize: Array<number> = [1000, 1000];

    const scale = Math.min(
        window.innerWidth / virtualSize[0],
        window.innerHeight / virtualSize[1]
    )

    return <Col xs={7}>
        <Stage width={window.innerWidth} height={window.innerHeight} scaleX={scale} scaleY={scale}>
            <Layer>
                <Circle x={virtualSize[0] / 2} y={virtualSize[1] / 2} radius={100} color={"yellow"}/>
            </Layer>
        </Stage>
    </Col>;
}

export default SolarView;