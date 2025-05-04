import { useSnapshot } from 'valtio'
import { ProvidedImage } from './blocks/provided-image';
import { GeneratedImage } from './blocks/generated-image';
import { AppNode, AppState, appState } from '../logic/model';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection, Controls, Edge, EdgeChange, MiniMap, NodeChange, ReactFlow, ReactFlowInstance, reconnectEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './workspace.css'
import { Inpainting } from './blocks/inpainting';


const NODE_TYPES = { 'provided-image': ProvidedImage, 'generated-image': GeneratedImage, 'inpainting': Inpainting };

async function updateNodes(changes: NodeChange[]) {
  appState.nodes = applyNodeChanges(changes, appState.nodes) as AppNode[];
}

async function updateEdges(changes: EdgeChange[]) {
  appState.edges = applyEdgeChanges(changes, appState.edges);
}

async function updateEdgeConnection(oldEdge: Edge, newConnection: Connection) {
    // if (!validConnectionUpdate(oldEdge, newConnection, appState.edges)) return;
    appState.edges = reconnectEdge(oldEdge, newConnection, appState.edges);
}

async function connectNodes(connection: Connection) {
    // if (!validConnection(connection, appState.edges)) return;
    appState.edges = addEdge(connection, appState.edges);
}

async function onLoad(reactFlowInstance: ReactFlowInstance<AppNode, Edge>) {
    appState.reactFlowInstance = reactFlowInstance;
}

export function Workspace() {
    const readOnlyState = useSnapshot(appState) as AppState;


    return <div className="workspace">
        <ReactFlow minZoom={0.1}
                   nodeTypes={NODE_TYPES}
                   nodes={readOnlyState.nodes}
                   edges={readOnlyState.edges}
                   onInit={onLoad}
                   onNodesChange={updateNodes}
                   onEdgesChange={updateEdges}
                   onReconnect={updateEdgeConnection}
                   onConnect={connectNodes}
                   colorMode='system'
                >
            
            <MiniMap nodeStrokeWidth={4}/>
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={50} size={2} color="#aaaaaa"/>

        </ReactFlow>
    </div>;
}
