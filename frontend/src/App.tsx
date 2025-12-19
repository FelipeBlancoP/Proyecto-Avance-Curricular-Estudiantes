import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MallaPage from './pages/MallaPage/mallaPage';
import MallaManual from './pages/MallaManual/MallaManual';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import MisSimulaciones from './pages/MisSimulaciones/MisSimulaciones';

function App() {
  return (
    <BrowserRouter>
      <div className='appContainer'>
        <main className='pageContent'>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/malla' element={<MallaPage />} />
            <Route path='/malla-manual' element={<MallaManual />} />
            <Route path='/' element={<Dashboard />} />
            <Route path="/mis-simulaciones" element={<MisSimulaciones />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;