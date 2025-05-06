import { useSnapshot } from 'valtio';
import { appState, resetState, loadState } from '../logic/model';
import './welcome-screen.css';

export function WelcomeScreen() {
  const snap = useSnapshot(appState);

  if (!snap.welcomeScreenVisible) {
    return null;
  }

  const handleStartNewProject = async () => {
    await resetState();
    appState.welcomeScreenVisible = false;
  };

  const handleOpenExistingProject = async () => {
    await loadState();
    appState.welcomeScreenVisible = false;
  };

  return (
    <div className="welcome-screen-overlay">
      <div className="welcome-screen-modal">
        <h1>Welcome to Image Workbench</h1>
        <p>Your creative space for image processing and generation</p>
        
        <div className="welcome-screen-buttons">
          <button 
            className="welcome-screen-button" 
            onClick={handleStartNewProject}
          >
            Start New Project
          </button>
          <button 
            className="welcome-screen-button" 
            onClick={handleOpenExistingProject}
          >
            Open Existing Project
          </button>
        </div>
      </div>
    </div>
  );
}