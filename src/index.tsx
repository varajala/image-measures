import * as React from "react";
import * as ReactDOM from "react-dom/client";

enum DrawMode {
    ReferenceStart,
    ReferenceEnd,
    MeasureStart,
    MeasureEnd,
}

interface IPoint {
    readonly x: number;
    readonly y: number;
}

interface IContext {
    dc: CanvasRenderingContext2D | null;
    imageWidth: number;
    imageHeight: number;
    referenceStart: IPoint;
    referenceEnd: IPoint;
    measureStart: IPoint;
    measureEnd: IPoint;
}

const emptyContext: IContext = {
    dc: null,
    imageWidth: 0,
    imageHeight: 0,
    referenceStart: { x: 0, y: 0 },
    referenceEnd: { x: 0, y: 0 },
    measureStart: { x: 0, y: 0 },
    measureEnd: { x: 0, y: 0 },
};


function drawLine(context: CanvasRenderingContext2D, start: IPoint, end: IPoint, color: string) {
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
}

function calculateLength(a: IPoint, b: IPoint): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function parsePositiveInteger(input: string): number {
    const num = Number.parseInt(input);
    return Number.isNaN(num) ? 0 : Math.abs(num);
}

const Application: React.FunctionComponent = () => {
    const [canvasElement, setCanvasElement] = React.useState<HTMLCanvasElement | null>(null);
    const [filePickerElement, setFilePickerElement] = React.useState<HTMLInputElement | null>(null);
    const [referenceLengthInputElement, setReferenceLengthInputElement] = React.useState<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<HTMLImageElement | null>(null);
    const [drawMode, setDrawMode] = React.useState<DrawMode>(DrawMode.ReferenceStart);
    const [context, setContext] = React.useState<IContext>(emptyContext);
    const [measureResult, setMeasureResult] = React.useState<number>(0);

    React.useEffect(() => {
        const canvas: HTMLElement | undefined = document.getElementById("display");
        if (canvas) {
            setCanvasElement(canvas as HTMLCanvasElement);
        }

        const filePicker: HTMLElement | undefined = document.getElementById("filePicker");
        if (filePicker) {
            setFilePickerElement(filePicker as HTMLInputElement);
        }

        const referenceLengthInput: HTMLElement | undefined = document.getElementById("referenceLengthInput");
        if (referenceLengthInput) {
            setReferenceLengthInputElement(referenceLengthInput as HTMLInputElement);
        }
    }, []);

    React.useEffect(() => {
        if (selectedImage === null || canvasElement === null) {
            return;
        }

        canvasElement.width = selectedImage.width;
        canvasElement.height = selectedImage.height;
        canvasElement.style.width = `${selectedImage.width}px`;
        canvasElement.style.height= `${selectedImage.height}px`;
        context.imageWidth = selectedImage.width;
        context.imageHeight = selectedImage.height;

        context.dc = canvasElement.getContext("2d");
        context.dc.drawImage(selectedImage, 0, 0);
        canvasElement.toDataURL("image/png");
        canvasElement.addEventListener("click", handleClick);
        return () => canvasElement.removeEventListener("click", handleClick);
    }, [canvasElement, selectedImage]);

    React.useEffect(() => {
        if (selectedImage === null || canvasElement === null) {
            return;
        }

        canvasElement.addEventListener("click", handleClick);
        return () => canvasElement.removeEventListener("click", handleClick);
    }, [canvasElement, selectedImage, drawMode, context]);

    function updateMeasure() {
        const referenceLength = calculateLength(context.referenceStart, context.referenceEnd);
        const measureLength = calculateLength(context.measureStart, context.measureEnd);
        const referenceInput = parsePositiveInteger(referenceLengthInputElement.value);

        if (referenceInput === 0 || referenceLength === 0 || measureLength === 0) {
            setMeasureResult(0);
        }

        const unitInPixels = referenceInput / referenceLength;
        setMeasureResult(measureLength * unitInPixels);
    }

    function handleClick(event: MouseEvent) {
        const rect = canvasElement.getBoundingClientRect();
        switch (drawMode) {
            case DrawMode.ReferenceStart: {
                setContext({ ...context, referenceStart: { x: event.clientX - rect.left, y: event.clientY - rect.top } });
                setDrawMode(DrawMode.ReferenceEnd);
                break;
            }

            case DrawMode.MeasureStart: {
                setContext({ ...context, measureStart: { x: event.clientX - rect.left, y: event.clientY - rect.top } });
                setDrawMode(DrawMode.MeasureEnd);
                break;
            }

            case DrawMode.ReferenceEnd: {
                const newContext = { ...context, referenceEnd: { x: event.clientX - rect.left, y: event.clientY - rect.top } };
                context.dc.drawImage(selectedImage, 0, 0);
                drawLine(context.dc, newContext.referenceStart, newContext.referenceEnd, "blue");
                drawLine(context.dc, newContext.measureStart, newContext.measureEnd, "red");
                setContext(newContext);
                setDrawMode(DrawMode.ReferenceStart);
                break;
            }

            case DrawMode.MeasureEnd: {
                const newContext = { ...context, measureEnd: { x: event.clientX - rect.left, y: event.clientY - rect.top } };
                context.dc.drawImage(selectedImage, 0, 0);
                drawLine(context.dc, newContext.referenceStart, newContext.referenceEnd, "blue");
                drawLine(context.dc, newContext.measureStart, newContext.measureEnd, "red");
                setContext(newContext);
                setDrawMode(DrawMode.MeasureStart);
                break;
            }
        }
    }

    function updateImageSelection() {
        const files = filePickerElement.files;
        if (files.length === 0) {
            return;
        }

        const imageFile = files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const image = new Image();
            image.src = fileReader.result as string;
            setSelectedImage(image);
        };
        fileReader.readAsDataURL(imageFile);
    }

    const hideImageSelection = selectedImage !== null;
    const hideDrawingInputs = selectedImage === null;
    return (
        <div>
            <div hidden={hideImageSelection}>
                <input type={"file"} id={"filePicker"} accept={"image/png"}></input>
                <button onClick={updateImageSelection}>Load</button>
            </div>
            <div hidden={hideDrawingInputs}>
                <button onClick={() => setDrawMode(DrawMode.ReferenceStart)}>Reference</button>
                <button onClick={() => setDrawMode(DrawMode.MeasureStart)}>Measure</button>
                <button onClick={() => updateMeasure()}>Calculate</button>
                <input type="number" min={0} max={Number.MAX_SAFE_INTEGER} id={"referenceLengthInput"}></input>
                <p>{measureResult}</p>
            </div>
            <canvas id={"display"} style={{ margin: "0px", padding: "0px" }}></canvas>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Application />);
