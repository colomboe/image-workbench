import { useSnapshot } from 'valtio';
import { appState, updateInpaintingMask } from '../logic/model';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Editor, EditorMode } from 'mini-canvas-editor';
import { MceImage } from 'mini-canvas-core';
import { BiSolidSave, BiX } from 'react-icons/bi';

import './inpainter-canvas.css';

export function InpainterCanvas() {

    const placeholderRef = useRef(null);
    const inpainterState = useSnapshot(appState.inpainter);
    const [editor, setEditor] = useState<Editor | null>(null);

    useEffect(() => {
        if (placeholderRef.current === null) return;

        if (inpainterState.visible) {
            const image = new Image();
            image.src = `data:image/png;base64,${inpainterState.imageB64}`;

            const editor = Editor.createFromImage(
                placeholderRef.current,
                image,
                {
                    selectable: false,
                },
                {
                    initialMode: EditorMode.brush,
                    brush: {
                        brushColor: '#ff0000',
                        brushSize: 20
                    },
                    rect: {
                        fillColor: '#ff0000'
                    },
                    image: false,
                    textbox: false,
                }
            );
            setEditor(editor);
        } else {
            editor?.destroy();
            setEditor(null);
        }
    }, [inpainterState.visible, placeholderRef]);

    function saveMask() {
        if (!editor) throw new Error('Editor not initialized');

        const objects = editor.getWorkspaceObjects();
		const image = objects.find(o => o instanceof MceImage) as MceImage;
        const [_, maskCanvasContext] = createMemoryCanvas(editor.getWidth(), editor.getHeight());
		objects.forEach(obj => {
			if (obj !== image) {
				obj.render(maskCanvasContext);
			}
		});
        const [imageCanvas, imageCanvasContext] = createMemoryCanvas(editor.getWidth(), editor.getHeight());
        image.render(imageCanvasContext);
        applyMask(editor.getWidth(), editor.getHeight(), imageCanvasContext, maskCanvasContext);

        const maskB64 = imageCanvas.toDataURL();
        const prefix = 'data:image/png;base64,';
        const cleanMaskBase64 = maskB64.startsWith(prefix) ? maskB64.slice(prefix.length) : maskB64;
        updateInpaintingMask(inpainterState.blockId!, cleanMaskBase64);
        appState.inpainter.visible = false;
    }

    if (inpainterState.visible)
        return <div className="inpainter-canvas">
            <div className="inpainter-canvas-header">
                <button onClick={saveMask}><BiSolidSave/></button>
                <button onClick={() => { appState.inpainter.visible = false; }}><BiX/></button>
            </div>
            <div className="inpainter-canvas-body" ref={placeholderRef} />
        </div>;
    else
        return null;

}

function createMemoryCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;
	canvasContext.fillStyle = '#ffffff00';
	canvasContext.fillRect(0, 0, width, height);
	return [canvas, canvasContext];
}

function applyMask(width: number, height: number, target: CanvasRenderingContext2D, mask: CanvasRenderingContext2D) {
	const imageCanvasData = target.getImageData(0, 0, width, height);
	const maskCanvasData = mask.getImageData(0, 0, width, height);
	for (let i = 0; i < imageCanvasData.data.length; i += 4) {
		imageCanvasData.data[i + 3] = 255 - maskCanvasData.data[i + 3];
	}
	target.putImageData(imageCanvasData, 0, 0);
}