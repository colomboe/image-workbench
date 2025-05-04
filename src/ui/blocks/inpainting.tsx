import { Handle, NodeProps, NodeResizer, Position } from "@xyflow/react";
import { appState, getUpdatableData, InpaintingNodeData } from "../../logic/model";
import { Node } from '@xyflow/react';
import { useState } from "preact/hooks";
import { renderWhen } from "../utils";

import 'mini-canvas-editor/css/editor.css';
import { BiPaint } from "react-icons/bi";


export function Inpainting(props: NodeProps<Node<InpaintingNodeData, 'inpainting'>>) {
    const [name, setName] = useState<string>(props.data.name);
    
    function showInpainterCanvas() {
        appState.inpainter.visible = true;
        appState.inpainter.imageB64 = props.data.imageB64;
        appState.inpainter.blockId = props.id;  
    }

    function updateName(name: string) {
        setName(name);
        getUpdatableData<InpaintingNodeData>(props.id, 'inpainting').name = name;
    }
    
    return (
        <>
            <div className="ui-block">
                <NodeResizer minWidth={400} minHeight={300} maxWidth={props.data.width} maxHeight={props.data.height} isVisible={props.selected} keepAspectRatio={true} handleClassName="block-handle" lineClassName="block-selection-line" />

                <div className="background-image">
                    <div className="transparent-bg">
                        <img
                            className="image"
                            src={`data:image/png;base64,${props.data.imageB64}`}
                            style={{ cursor: 'pointer' }}
                            // onClick={() => showInpainterCanvas()}
                        />
                    </div>
                </div>

                <div className="overlay">
                    <div className="inPorts">
                        <Handle id="in" type="target" className="snapArea" position={Position.Left} />
                    </div>
                    <div className="body">
                        <div className="body-entry">
                            <span>Name:</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e: any) => updateName(e.currentTarget.value)}
                                className="theme-aware-input"
                            />
                        </div>
                        <div className="body-entry">
                            <span>Actions:</span>
                            <button onClick={showInpainterCanvas}><BiPaint /> Edit mask</button>
                        </div>
                    </div>
                    <div className="outPorts">
                        {renderWhen(props.data.status !== 'prompt',
                        <Handle id="out" className="snapArea" type="source" position={Position.Right} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}