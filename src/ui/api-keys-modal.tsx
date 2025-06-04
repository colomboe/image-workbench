import { useState } from 'preact/hooks';
import { useSnapshot } from 'valtio';
import { appState } from '../logic/model';
import { BiX, BiKey } from 'react-icons/bi';
import './api-keys-modal.css';

export interface ApiKeysModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (apiKeys: { openai?: string; gemini?: string; replicate?: string }) => void;
}

export function ApiKeysModal({ visible, onClose, onSave }: ApiKeysModalProps) {
    const state = useSnapshot(appState);
    
    // Initialize form state with current values
    const [openaiKey, setOpenaiKey] = useState(
        state.modelSettings.apiKeys?.openai || ''
    );
    const [geminiKey, setGeminiKey] = useState(state.modelSettings.apiKeys?.gemini || '');
    const [replicateKey, setReplicateKey] = useState(state.modelSettings.apiKeys?.replicate || '');

    if (!visible) return null;

    const handleSave = () => {
        const apiKeys = {
            openai: openaiKey.trim() || undefined,
            gemini: geminiKey.trim() || undefined,
            replicate: replicateKey.trim() || undefined,
        };
        onSave(apiKeys);
        onClose();
    };

    const handleCancel = () => {
        // Reset form to current values
        setOpenaiKey(state.modelSettings.apiKeys?.openai || '');
        setGeminiKey(state.modelSettings.apiKeys?.gemini || '');
        setReplicateKey(state.modelSettings.apiKeys?.replicate || '');
        onClose();
    };

    return (
        <div className="api-keys-modal-overlay" onClick={handleCancel}>
            <div className="api-keys-modal" onClick={(e) => e.stopPropagation()}>
                <div className="api-keys-modal-header">
                    <h2><BiKey /> Configure API Keys</h2>
                    <button className="close-button" onClick={handleCancel}>
                        <BiX />
                    </button>
                </div>
                
                <div className="api-keys-modal-body">
                    <p className="modal-description">
                        Enter your API keys for the image generation providers you want to use. 
                        Keys are stored locally in your browser.
                    </p>
                    
                    {/* Show current status */}
                    <div className="current-status">
                        <h3>Current Status:</h3>
                        <div className="status-indicators">
                            <span className={`status-indicator ${state.modelSettings.apiKeys?.openai ? 'configured' : 'missing'}`}>
                                OpenAI: {state.modelSettings.apiKeys?.openai ? 'Configured' : 'Not configured'}
                            </span>
                            <span className={`status-indicator ${state.modelSettings.apiKeys?.gemini ? 'configured' : 'missing'}`}>
                                Gemini: {state.modelSettings.apiKeys?.gemini ? 'Configured' : 'Not configured'}
                            </span>
                            <span className={`status-indicator ${state.modelSettings.apiKeys?.replicate ? 'configured' : 'missing'}`}>
                                Replicate: {state.modelSettings.apiKeys?.replicate ? 'Configured' : 'Not configured'}
                            </span>
                        </div>
                    </div>
                    
                    <div className={`api-key-group ${state.modelSettings.provider === 'openai' ? 'current-provider' : ''}`}>
                        <label htmlFor="openai-key">OpenAI API Key: {state.modelSettings.provider === 'openai' && <span className="current-badge">Current</span>}</label>
                        <input
                            id="openai-key"
                            type="password"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.currentTarget.value)}
                            placeholder="sk-..."
                            className="api-key-input"
                        />
                        <span className="api-key-note">Required for gpt-image-1 model</span>
                    </div>
                    
                    <div className={`api-key-group ${state.modelSettings.provider === 'gemini' ? 'current-provider' : ''}`}>
                        <label htmlFor="gemini-key">Gemini API Key: {state.modelSettings.provider === 'gemini' && <span className="current-badge">Current</span>}</label>
                        <input
                            id="gemini-key"
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.currentTarget.value)}
                            placeholder="AI..."
                            className="api-key-input"
                        />
                        <span className="api-key-note">Required for Gemini image generation</span>
                    </div>
                    
                    <div className={`api-key-group ${state.modelSettings.provider === 'replicate' ? 'current-provider' : ''}`}>
                        <label htmlFor="replicate-key">Replicate API Key: {state.modelSettings.provider === 'replicate' && <span className="current-badge">Current</span>}</label>
                        <input
                            id="replicate-key"
                            type="password"
                            value={replicateKey}
                            onChange={(e) => setReplicateKey(e.currentTarget.value)}
                            placeholder="r8_..."
                            className="api-key-input"
                        />
                        <span className="api-key-note">Required for Replicate models (flux-kontext-pro/max for editing, flux-schnell/1.1-pro/ultra for generation)</span>
                    </div>
                </div>
                
                <div className="api-keys-modal-footer">
                    <button className="modal-button secondary" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="modal-button primary" onClick={handleSave}>
                        Save API Keys
                    </button>
                </div>
            </div>
        </div>
    );
}
