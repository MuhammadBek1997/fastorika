import { useState } from 'react'
import './login.css'
import { useGlobalContext } from '../Context'
import { Link } from 'react-router-dom'

const Login = () => {

    let { t, theme, toggleTheme, handleChange, currentLang, currentLanguage, languages, cancelLogin, handleLogin } = useGlobalContext()

    const [themeOpen, setThemeOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)
    const [isShowPsw, setIsShowPsw] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')





    return (
        <div className='login-client' style={{
            width: '100vw',
            height: '100vh',
            background: `url(/images/BG${theme}.png) 100% 0 no-repeat`,
            backgroundSize: "cover"
        }}>
            <nav className='fixed flex justify-between p-5'>
                <button onClick={() => cancelLogin()} className='logo'>
                    <img src={`/images/logo${theme}.png`} alt="" />
                </button>
                <div className="dropdowns-cont" style={{ top: "1rem" }}>
                    {/* Theme Dropdown */}
                    <div className="themeDropdown">
                        <button
                            onClick={() => {
                                setThemeOpen(!themeOpen)
                                setLangOpen(false)
                            }}
                            className="themeToggle"
                            aria-label="Theme menu"
                        >
                            {theme === 'light' ? (
                                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                                </svg>
                            ) : (
                                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                                </svg>
                            )}
                            <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>

                        {themeOpen && (
                            <div className="themeDropdownMenu">
                                <button
                                    onClick={() => {
                                        if (theme !== 'light') toggleTheme()
                                        setThemeOpen(false)
                                    }}
                                    className={`themeOption ${theme === 'light' ? 'active' : ''}`}
                                >
                                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Light</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (theme !== 'dark') toggleTheme()
                                        setThemeOpen(false)
                                    }}
                                    className={`themeOption ${theme === 'dark' ? 'active' : ''}`}
                                >
                                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                                    </svg>
                                    <span>Dark</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Language Dropdown */}
                    <div className="langDropdown">
                        <button
                            onClick={() => {
                                setLangOpen(!langOpen)
                                setThemeOpen(false)
                            }}
                            className="langToggle"
                            aria-label="Language menu"
                        >
                            <img src={currentLang.flag} alt="" className="langImg" />
                            <span className="langCode">{currentLang.code.toUpperCase()}</span>
                            <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>

                        {langOpen && (
                            <div className="langDropdownMenu">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            handleChange(lang.code)
                                            setLangOpen(false)
                                        }}
                                        className={`langOption ${currentLanguage === lang.code ? 'active' : ''}`}
                                    >
                                        <img src={lang.flag} alt="" className="langImg" />
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <div className='login-cont'>
                <h1>
                    {t("login-client")}
                </h1>
                <div className='login-cont-top'>
                    <p>
                        {t("login-clientToptext")}
                    </p>
                    <Link to={'/registration'} style={{ color: "#348BDC" }}>
                        {t("login-clientToplink")}
                    </Link>
                </div>
                <div className='login-cont-form'>
                    <label htmlFor="">
                        {t("login-clientForm1")}
                    </label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    <label htmlFor="">
                        {t("login-clientForm2")}
                    </label>
                    <div className='login-cont-form-psw'>
                        <input type={isShowPsw ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} />
                        <img src={!isShowPsw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`} alt="" onClick={() => setIsShowPsw(!isShowPsw)} />
                    </div>
                </div>
                <button className='login-clientBtn' onClick={()=>handleLogin(email, password)}>
                    {t("login")}
                </button>
                <Link to={'/registration'} style={{ color: "#348BDC", marginLeft: "32.5%" }}>
                    {t("login-clientForgot")}
                </Link>
                <div className='login-or'>
                    <hr />
                    <p>
                        {t("or")}
                    </p>

                </div>
                <div className='login-clientProviders'>
                    <button>
                        <img src="/images/Google.png" alt="" />
                        {t("login-clientwithG")}
                    </button>
                    <button>
                        <img src={`/images/apple${theme}.png`} alt="" />
                        {t("login-clientwithA")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login