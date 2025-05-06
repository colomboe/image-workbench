import './app.css'
import { Toolbar } from './toolbar'
import { Workspace } from './workspace'
import { ToastContainer, showToast as showToastUI } from './toast'
import { setShowToast } from '../logic/toast-bridge'
import { InpainterCanvas } from './inpainter-canvas'
import { WelcomeScreen } from './welcome-screen'

export function App() {
  setShowToast(showToastUI);
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
