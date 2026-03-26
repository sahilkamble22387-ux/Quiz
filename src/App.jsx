import { Navigate, Route, Routes } from 'react-router-dom'
import Cursor from './components/Cursor'
import { MusicProvider } from './hooks/useMusic'
import AdminDashboard from './screens/AdminDashboard'
import HeartDoor from './screens/HeartDoor'
import Notification from './screens/Notification'
import Quiz from './screens/Quiz'
import Story from './screens/Story'
import Taken from './screens/Taken'
import TapToBegin from './screens/TapToBegin'

export default function App() {
  return (
    <MusicProvider>
      <Cursor />
      <Routes>
        <Route path="/" element={<TapToBegin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/gate" element={<Navigate to="/quiz" replace />} />
        <Route path="/taken" element={<Taken />} />
        <Route path="/heartdoor" element={<HeartDoor />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/story" element={<Story />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MusicProvider>
  )
}
