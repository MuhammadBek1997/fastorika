import { Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import { useGlobalContext } from './Context'
import Footer from './components/Footer'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Sidebar from './components/Sidebar'
import Transactions from './pages/Transactions'
import MyCards from './pages/MyCards'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Support from './pages/Support'


function App() {

  let { theme, clientPage } = useGlobalContext()

  let body = document.getElementById("root").parentElement

  body.parentElement.style.backgroundColor = theme == "dark" ? "#363636" : "#F0F0F0"


  if(localStorage.getItem("logged")){
    return(
      <div className='webClient' id={theme}>
        <Sidebar/>
        <Routes>
          <Route path='/transactions' element={<Transactions/>} />
          <Route path='/cards' element={<MyCards/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/settings' element={<Settings/>} />
          <Route path='/support' element={<Support/>} />
        </Routes>
      </div>
    )
  }else if (!localStorage.getItem("login")) {
    return (
      <div id={theme}>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<AboutUs />} />
        </Routes>
        <Footer />
      </div>
    )
  } else {
    return (
      <div id={theme}>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/registration' element={<Registration />} />
        </Routes>
      </div>
    )
  }
}

export default App
