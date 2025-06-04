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

    const updateReplicateEditingModel = (model: 'flux-kontext-pro' | 'flux-kontext-max') => {
        appState.modelSettings.replicateEditingModel = model;
    };

    const updateReplicateGenerationModel = (model: 'flux-schnell' | 'flux-1.1-pro' | 'flux-1.1-pro-ultra') => {
        appState.modelSettings.replicateGenerationModel = model;
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
                                title="Replicate flux-kontext-pro model"
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
                        <>
                            <div className="setting-group">
                                <label>Editing Model:</label>
                                <div className="setting-options">
                                    <button 
                                        className={`setting-button ${state.modelSettings.replicateEditingModel === 'flux-kontext-pro' ? 'active' : ''}`}
                                        onClick={() => updateReplicateEditingModel('flux-kontext-pro')}
                                        title="Standard quality image editing"
                                    >
                                        Kontext Pro
                                    </button>
                                    <button 
                                        className={`setting-button ${state.modelSettings.replicateEditingModel === 'flux-kontext-max' ? 'active' : ''}`}
                                        onClick={() => updateReplicateEditingModel('flux-kontext-max')}
                                        title="Premium quality image editing"
                                    >
                                        Kontext Max
                                    </button>
                                </div>
                            </div>
                            <div className="setting-group">
                                <label>Generation Model:</label>
                                <div className="setting-options">
                                    <button 
                                        className={`setting-button ${state.modelSettings.replicateGenerationModel === 'flux-schnell' ? 'active' : ''}`}
                                        onClick={() => updateReplicateGenerationModel('flux-schnell')}
                                        title="Fast generation"
                                    >
                                        Schnell
                                    </button>
                                    <button 
                                        className={`setting-button ${state.modelSettings.replicateGenerationModel === 'flux-1.1-pro' ? 'active' : ''}`}
                                        onClick={() => updateReplicateGenerationModel('flux-1.1-pro')}
                                        title="High quality generation"
                                    >
                                        1.1 Pro
                                    </button>
                                    <button 
                                        className={`setting-button ${state.modelSettings.replicateGenerationModel === 'flux-1.1-pro-ultra' ? 'active' : ''}`}
                                        onClick={() => updateReplicateGenerationModel('flux-1.1-pro-ultra')}
                                        title="Ultra high quality generation"
                                    >
                                        1.1 Ultra
                                    </button>
                                </div>
                            </div>
                            <div className="provider-info">
                                <span className="provider-note">Editing requires input image, Generation works standalone</span>
                            </div>
                        </>
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
