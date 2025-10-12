
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import { useGlobalContext } from './Context'


function App() {

  let {theme} = useGlobalContext()


  return (
    <div id={theme} className='pt-4'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/about' element={<AboutUs/>} />
        
      </Routes>
    </div>
  )
}

export default App
