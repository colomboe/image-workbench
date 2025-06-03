import { createGeneratedImageNode, loadState, persistState, resetState, importImageNode, appState, setApiKeys } from '../logic/model';
import { BiFile, BiFolderOpen, BiPlus, BiSolidSave, BiUpload, BiKey } from 'react-icons/bi';
import { showToast } from '../logic/toast-bridge';
import { useSnapshot } from 'valtio';
import { useState } from 'preact/hooks';
import { ApiKeysModal } from './api-keys-modal';

import "./toolbar.css"

export function Toolbar() {
    const state = useSnapshot(appState);
    const [showApiKeysModal, setShowApiKeysModal] = useState(false);
    
    const updateQuality = (quality: 'low' | 'medium' | 'high') => {
        appState.modelSettings.quality = quality;
    };
    
    const updateSize = (size: '1024x1024' | '1536x1024' | '1024x1536') => {
        appState.modelSettings.size = size;
    };
    
    const updateBackground = (background: 'transparent' | 'opaque' | 'auto') => {
        appState.modelSettings.background = background;
    };

    const updateProvider = (provider: 'openai' | 'gemini' | 'replicate') => {
        appState.modelSettings.provider = provider;
    };
    
    const configureApiKey = () => {
        setShowApiKeysModal(true);
    };

    const handleApiKeysSave = (apiKeys: { openai?: string; gemini?: string; replicate?: string }) => {
        setApiKeys(apiKeys);
    };
    
    return (
        <>
            <div className="toolbar">
                <div className="model-settings">
                    <div className="setting-group">
                        <label>Provider:</label>
                        <div className="setting-options">
                            <button 
                                className={`setting-button ${state.modelSettings.provider === 'openai' ? 'active' : ''}`}
                                onClick={() => updateProvider('openai')}
                            >
                                OpenAI
                            </button>
                            <button 
                                className={`setting-button ${state.modelSettings.provider === 'gemini' ? 'active' : ''}`}
                                onClick={() => updateProvider('gemini')}
                            >
                                Gemini
                            </button>
                            <button 
                                className={`setting-button ${state.modelSettings.provider === 'replicate' ? 'active' : ''}`}
                                onClick={() => updateProvider('replicate')}
                                disabled={true}
                                title="Replicate support coming soon"
                            >
                                Replicate
                            </button>
                        </div>
                    </div>
                    {state.modelSettings.provider === 'openai' && (
                        <>
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
                        </>
                    )}
                    {state.modelSettings.provider === 'gemini' && (
                        <div className="provider-info">
                            <span className="provider-note">Gemini: Default generation settings</span>
                        </div>
                    )}
                    {state.modelSettings.provider === 'replicate' && (
                        <div className="provider-info">
                            <span className="provider-note">Replicate: Coming soon</span>
                        </div>
                    )}
                </div>
                {state.currentProjectDirectory && (
                    <div className="project-name">
                        <span title="Current project directory">Project: {state.currentProjectDirectory}</span>
                    </div>
                )}
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
                    className={`toolbar-button ${(state.modelSettings.apiKeys?.openai || state.modelSettings.apiKeys?.gemini || state.modelSettings.apiKeys?.replicate) ? 'has-keys' : ''}`}
                    title="Configure API Keys"
                    onClick={configureApiKey}
                 >
                    <BiKey />
                 </button>
            </div>
            <ApiKeysModal
                visible={showApiKeysModal}
                onClose={() => setShowApiKeysModal(false)}
                onSave={handleApiKeysSave}
            />
        </>
    );
}
