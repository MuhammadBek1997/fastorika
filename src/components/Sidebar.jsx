import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const Sidebar = () => {
    const [themeSideOpen, setThemeSideOpen] = useState(false)
    const [langSideOpen, setLangSideOpen] = useState(false)
    const [isSideMobileMenuOpen, setIsSideMobileMenuOpen] = useState(false)
    let { t, theme, navigate, toggleTheme, languages, currentLang, currentLanguage, handleChange } = useGlobalContext()
    return (
        <div className='sidebar'>
            <div className='sidebar-top'>
                <button
                    onClick={() => setIsSideMobileMenuOpen(!isSideMobileMenuOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden"
                    aria-controls="navbar-sticky"
                    aria-expanded={isSideMobileMenuOpen}
                >
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div className='sidebar-logo'>
                    <img src={`/images/logo${theme}.png`} className="h-8" alt="Logo" />
                </div>
                <div className={`${isSideMobileMenuOpen ?  'hidden':'block' } sidebar-sticky-list`} id='navbar-sticky'>
                    <div className="sidebar-list">
                        <Link to={'/transactions'} onClick={()=>setIsSideMobileMenuOpen(true)}>
                            Transactions
                        </Link>
                        <Link to={'/cards'} onClick={()=>setIsSideMobileMenuOpen(true)}>
                            My cards
                        </Link>
                        <Link to={'/profile'} onClick={()=>setIsSideMobileMenuOpen(true)}>
                            Profile
                        </Link>
                        <Link to={'/settings'} onClick={()=>setIsSideMobileMenuOpen(true)}>
                            Settings
                        </Link>
                        <Link to={'/support'} onClick={()=>setIsSideMobileMenuOpen(true)}>
                            Support
                        </Link>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem("logged")
                        navigate('/')
                    }} className='forM'>
                        logout
                    </button>
                </div>
            </div>
            <div className='sidebar-bottom'>
                <div className="dropdowns-cont" style={{ top: "2.3rem" }}>
                    {/* Theme Dropdown */}
                    <div className="themeDropdown">
                        <button
                            onClick={() => {
                                setThemeSideOpen(!themeSideOpen)
                                setLangSideOpen(false)
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

                        {themeSideOpen && (
                            <div className="themeDropdownMenu left-0">
                                <button
                                    onClick={() => {
                                        if (theme !== 'light') toggleTheme()
                                        setThemeSideOpen(false)
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
                                        setThemeSideOpen(false)
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
                                setLangSideOpen(!langSideOpen)
                                setThemeSideOpen(false)
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

                        {langSideOpen && (
                            <div className="langDropdownMenu">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            handleChange(lang.code)
                                            setLangSideOpen(false)
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
                <button onClick={() => {
                    localStorage.removeItem("logged")
                    navigate('/')
                }} className='forD'>
                    logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar