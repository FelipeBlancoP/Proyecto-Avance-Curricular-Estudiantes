import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MallaPage from './pages/MallaPage/mallaPage';

function App(){
  return (
    <BrowserRouter>
      <div className='appContainer'>

        <main className='pageContent'>
          <Routes>
            <Route path='/malla' element={<MallaPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;