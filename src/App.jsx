
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import { useGlobalContext } from './Context'
import Footer from './components/Footer'


function App() {

  let {theme} = useGlobalContext()

  let body = document.getElementById("root").parentElement

  body.parentElement.style.backgroundColor = theme == "dark" ? "#363636" : "#F0F0F0"
  

  return (
    <div id={theme} className='pt-4'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/about' element={<AboutUs/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
