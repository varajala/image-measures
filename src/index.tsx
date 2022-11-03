import * as React from "react";
import * as ReactDOM from "react-dom/client";

const Application: React.FunctionComponent = () => {
    const [canvasElement, setCanvasElement] = React.useState<HTMLCanvasElement | null>(null);
    const [filePickerElement, setFilePickerElement] = React.useState<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<HTMLImageElement | null>(null);

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

        const drawContext = canvasElement.getContext("2d");
        drawContext.drawImage(selectedImage, 0, 0);
        canvasElement.toDataURL("image/png");
    }, [selectedImage]);

    function updateImageSelection(event: React.SyntheticEvent<HTMLButtonElement>) {
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

    return (
        <div>
            <div>
                <input type={"file"} id={"filePicker"} accept={"image/png"}></input>
                <button onClick={updateImageSelection}>Load</button>
            </div>
            <canvas id={"display"}></canvas>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Application />);
