import * as React from "react";
import * as ReactDOM from "react-dom/client";

enum DrawMode {
    Reference,
    Measure,
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
    referenceLength: number;
    measureStart: IPoint;
    measureEnd: IPoint;
}

const context: IContext = {
    dc: null,
    imageWidth: 0,
    imageHeight: 0,
    referenceStart: { x: 0, y: 0 },
    referenceEnd: { x: 0, y: 0 },
    referenceLength: 0,
    measureStart: { x: 0, y: 0 },
    measureEnd: { x: 0, y: 0 },
};

const Application: React.FunctionComponent = () => {
    const [canvasElement, setCanvasElement] = React.useState<HTMLCanvasElement | null>(null);
    const [filePickerElement, setFilePickerElement] = React.useState<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<HTMLImageElement | null>(null);
    const [drawMode, setDrawMode] = React.useState<DrawMode>(DrawMode.Reference);

    React.useEffect(() => {
        const canvas: HTMLElement | undefined = document.getElementById("display");
        if (canvas) {
            setCanvasElement(canvas as HTMLCanvasElement);
        }

        const filePicker: HTMLElement | undefined = document.getElementById("filePicker");
        if (canvas) {
            setFilePickerElement(filePicker as HTMLInputElement);
        }

    }, []);

    React.useEffect(() => {
        if (selectedImage === null || canvasElement === null) {
            return;
        }

        canvasElement.width = selectedImage.width;
        canvasElement.height = selectedImage.height;
        context.imageWidth = selectedImage.width;
        context.imageHeight = selectedImage.height;

        context.dc = canvasElement.getContext("2d");
        context.dc.drawImage(selectedImage, 0, 0);
        canvasElement.toDataURL("image/png");
        canvasElement.addEventListener("click", startLine);
    }, [selectedImage]);

    function startLine(event: MouseEvent) {
        console.log(context);
        context.dc.drawImage(selectedImage, 0, 0);
        context.referenceStart = { x: event.x, y: event.y };
        canvasElement.removeEventListener("click", startLine);
        canvasElement.addEventListener("click", endLine);
    }

    function endLine(event: MouseEvent) {
        console.log(context);
        context.referenceEnd = { x: event.x, y: event.y };
        context.dc.beginPath();
        context.dc.moveTo(context.referenceStart.x, context.referenceStart.y);
        context.dc.lineTo(event.x, event.y);
        context.dc.stroke();

        canvasElement.removeEventListener("click", endLine);
        canvasElement.addEventListener("click", startLine);
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
                <button onClick={() => setDrawMode(DrawMode.Reference)}>Reference</button>
                <button onClick={() => setDrawMode(DrawMode.Measure)}>Measure</button>
            </div>
            <canvas id={"display"}></canvas>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Application />);
