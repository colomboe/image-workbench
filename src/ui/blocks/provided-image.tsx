import { Handle, NodeProps, NodeResizer, Position, Node } from '@xyflow/react';
import { useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { deriveInpainting, getUpdatableData, ProvidedImageNodeData } from '../../logic/model';
import { BiFullscreen, BiPaint } from 'react-icons/bi';
import './common-style.css';

export function ProvidedImage(props: NodeProps<Node<ProvidedImageNodeData, 'provided-image'>>) {
    const [name, setName] = useState(props.data.name);
    const [showModal, setShowModal] = useState(false);

    function updateName(newName: string) {
        setName(newName);
        getUpdatableData<ProvidedImageNodeData>(props.id, 'provided-image').name = newName;
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
                    <img
                        src={`data:image/png;base64,${props.data.imageB64}`}
                        onClick={() => setShowModal(true)}
                    />
                </div>

                <div className="overlay">
                    <div className="inPorts">
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
                            <div className="actions">
                                <button onClick={() => deriveInpainting(props.id)}><BiPaint /> Inpaint</button>
                                <button onClick={() => setShowModal(true)}><BiFullscreen /> View fullscreen</button>
                            </div> 
                        </div>
                    </div>
                    <div className="outPorts">
                        <Handle id="out" type="source" className="snapArea" position={Position.Right} />
                    </div>
                </div>
            </div>
        </>
    );
}