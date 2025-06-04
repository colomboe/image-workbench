import { Handle, NodeProps, NodeResizer, Position, useUpdateNodeInternals } from "@xyflow/react";
import { deriveInpainting, GeneratedImageNodeData, generateImage, getUpdatableData } from "../../logic/model";
import { Node } from '@xyflow/react';
import { useEffect, useState } from "preact/hooks";
import { TargetedEvent } from "preact/compat";
import { createPortal } from "preact/compat";
import { BiFullscreen, BiPaint, BiSolidMagicWand, BiEditAlt } from "react-icons/bi";
import { renderWhen } from "../utils";
import { enhancePrompt } from "../../logic/prompt-enhancer";
import { showToast } from "../../logic/toast-bridge";
import "./common-style.css";

export function GeneratedImage(props: NodeProps<Node<GeneratedImageNodeData, 'generated-image'>>) {
    const [prompt, setPrompt] = useState<string>(props.data.prompt);
    const [name, setName] = useState<string>(props.data.name);
    const [showModal, setShowModal] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => updateNodeInternals(props.id), [props.id, updateNodeInternals, props.data.status]);

    function updateName(name: string) {
        setName(name);
        getUpdatableData<GeneratedImageNodeData>(props.id, 'generated-image').name = name;
    }
    function updatePrompt(prompt: string) {
        setPrompt(prompt);
        getUpdatableData<GeneratedImageNodeData>(props.id, 'generated-image').prompt = prompt;
    }

    async function handleEnhancePrompt() {
        if (isEnhancing) return;
        
        setIsEnhancing(true);
        const result = await enhancePrompt(prompt);
        setIsEnhancing(false);
        
        if (result.type === 'error') {
            showToast(`Error: ${result.message}`, 5000);
        } else {
            updatePrompt(result.enhancedPrompt);
            showToast('Prompt enhanced successfully!', 3000);
        }
    }

    return (
        <>
            {showModal && typeof window !== 'undefined' && createPortal(
                <div
                    className="image-modal"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        cursor: 'pointer',
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <img
                        src={`data:image/png;base64,${props.data.imageB64}`}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            boxShadow: '0 0 32px #000',
                            borderRadius: '8px',
                        }}
                        alt={name || 'Generated'}
                    />
                </div>,
                document.body
            )}
            <div className="ui-block">
                <NodeResizer minWidth={400} minHeight={300} maxWidth={props.data.width} maxHeight={props.data.height} isVisible={props.selected} keepAspectRatio={true} handleClassName="block-handle" lineClassName="block-selection-line" />
                
                <div className="background-image">
                    {renderWhen(props.data.status === 'completed',
                        <img
                            src={`data:image/png;base64,${props.data.imageB64}`}
                            onClick={() => setShowModal(true)}
                        />
                    )}
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
                                onChange={(e) => updateName((e as TargetedEvent<HTMLInputElement, Event>).currentTarget.value)}
                                className="theme-aware-input"
                            />
                        </div>
                        <div className="body-entry">
                            <span>Prompt:</span>
                            { renderWhen(props.data.status === 'prompt',
                                <div className="actions">
                                    <button onClick={() => generateImage(props.id)}><BiSolidMagicWand />Generate</button>
                                    <button 
                                        onClick={handleEnhancePrompt} 
                                        disabled={isEnhancing}
                                        style={{ opacity: isEnhancing ? 0.6 : 1 }}
                                    >
                                        <BiEditAlt />{isEnhancing ? 'Enhancing...' : 'Enhance prompt'}
                                    </button>
                                </div>
                            )}
                            { renderWhen(props.data.status === 'completed',
                                <div className="actions">
                                    <button onClick={() => deriveInpainting(props.id)}><BiPaint /> Inpaint</button>
                                    <button onClick={() => setShowModal(true)}><BiFullscreen /> View fullscreen</button>
                                </div>
                            )}
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e: TargetedEvent<HTMLTextAreaElement, Event>) => updatePrompt(e.currentTarget.value)}
                            className="theme-aware-textarea" />
                        {renderWhen(props.data.status == 'processing',
                            <div className="body-entry">
                                Please wait... Generating image...
                            </div>
                        )}
                        {renderWhen(
                            props.data.status === 'completed',
                            <div className="body-entry">
                                Estimated cost: {props.data.costDollars ? "$" + props.data.costDollars.toFixed(4) : "N/A"} 
                            </div>
                        )}
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