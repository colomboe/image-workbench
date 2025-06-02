import './app.css'
import { Toolbar } from './toolbar'
import { Workspace } from './workspace'
import { ToastContainer, showToast as showToastUI } from './toast'
import { setShowToast } from '../logic/toast-bridge'
import { InpainterCanvas } from './inpainter-canvas'
import { WelcomeScreen } from './welcome-screen'
import { initializeApp } from '../logic/model'
import { useEffect } from 'preact/hooks'

export function App() {
  setShowToast(showToastUI);
  
  // Initialize app state on mount
  useEffect(() => {
    initializeApp();
  }, []);
  
  return (
    <>
      <Toolbar />
      <Workspace />
      <InpainterCanvas />
      <ToastContainer />
      <WelcomeScreen />
    </>
  )
}
