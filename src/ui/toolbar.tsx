import { createGeneratedImageNode, loadState, persistState, resetState, importImageNode, appState, setApiKey, clearApiKey } from '../logic/model';
import { BiFile, BiFolderOpen, BiPlus, BiSolidSave, BiUpload, BiKey } from 'react-icons/bi';
import { showToast } from '../logic/toast-bridge';
import { useSnapshot } from 'valtio';

import "./toolbar.css"

export function Toolbar() {
    const state = useSnapshot(appState);
    
    const updateQuality = (quality: 'low' | 'medium' | 'high') => {
        appState.modelSettings.quality = quality;
    };
    
    const updateSize = (size: '1024x1024' | '1536x1024' | '1024x1536') => {
        appState.modelSettings.size = size;
    };
    
    const updateBackground = (background: 'transparent' | 'opaque' | 'auto') => {
        appState.modelSettings.background = background;
    };
    
    const configureApiKey = () => {
        const apiKey = window.prompt('Enter your OpenAI API Key (leave empty to clear):', state.modelSettings.apiKey || '');
        
        if (apiKey === null) {
            // User canceled the prompt
            return;
        }
        
        if (apiKey.trim() === '') {
            clearApiKey();
        } else {
            setApiKey(apiKey);
        }
    };
    
    return (
        <div className="toolbar">
            <div className="model-settings">
                <div className="setting-group">
                    <label>Quality:</label>
                    <div className="setting-options">
                        <button 
                            className={`setting-button ${state.modelSettings.quality === 'low' ? 'active' : ''}`}
                            onClick={() => updateQuality('low')}
                        >
                            Low
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.quality === 'medium' ? 'active' : ''}`}
                            onClick={() => updateQuality('medium')}
                        >
                            Medium
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.quality === 'high' ? 'active' : ''}`}
                            onClick={() => updateQuality('high')}
                        >
                            High
                        </button>
                    </div>
                </div>
                <div className="setting-group">
                    <label>Size:</label>
                    <div className="setting-options">
                        <button 
                            className={`setting-button ${state.modelSettings.size === '1024x1024' ? 'active' : ''}`}
                            onClick={() => updateSize('1024x1024')}
                        >
                            1024x1024
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.size === '1536x1024' ? 'active' : ''}`}
                            onClick={() => updateSize('1536x1024')}
                        >
                            1536x1024
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.size === '1024x1536' ? 'active' : ''}`}
                            onClick={() => updateSize('1024x1536')}
                        >
                            1024x1536
                        </button>
                    </div>
                </div>
                <div className="setting-group">
                    <label>Background:</label>
                    <div className="setting-options">
                        <button 
                            className={`setting-button ${state.modelSettings.background === 'transparent' ? 'active' : ''}`}
                            onClick={() => updateBackground('transparent')}
                        >
                            Transparent
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.background === 'opaque' ? 'active' : ''}`}
                            onClick={() => updateBackground('opaque')}
                        >
                            Opaque
                        </button>
                        <button 
                            className={`setting-button ${state.modelSettings.background === 'auto' ? 'active' : ''}`}
                            onClick={() => updateBackground('auto')}
                        >
                            Auto
                        </button>
                    </div>
                </div>
            </div>
            <button className="toolbar-button" onClick={resetState} title="New project">
                <BiFile />
            </button>
            <button className="toolbar-button" onClick={loadState} title="Open project">
                <BiFolderOpen />
            </button>
            <button className="toolbar-button" onClick={persistState} title="Save project">
                <BiSolidSave />
            </button>
            <div style={{ width: '30px' }} />
            <button className="toolbar-button" onClick={createGeneratedImageNode} title="New generated image">
                <BiPlus />
            </button>
            <button
                className="toolbar-button"
                title="Import image"
                onClick={() =>
                    importImageNode().catch((err) => showToast(err.message, 3000))
                }
            >
                 <BiUpload />
             </button>
             <button
                className="toolbar-button"
                title="Configure API Key"
                onClick={configureApiKey}
             >
                <BiKey />
             </button>
        </div>
    );
}
