import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MallaPage from './pages/MallaPage/mallaPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';

function App() {
  return (
    <BrowserRouter>
      <div className='appContainer'>
        <main className='pageContent'>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/malla' element={<MallaPage />} />
            <Route path='/' element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;