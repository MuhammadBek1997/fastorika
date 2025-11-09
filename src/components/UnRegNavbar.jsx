import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context'
import { Link, useLocation } from 'react-router-dom'

const UnRegNavbar = () => {
    let { t, theme, navigate, currentLang, currentLanguage, handleChange, languages, toggleTheme, selPayment } = useGlobalContext()
    const [themeUnavOpen, setThemeUnavOpen] = useState(false)
    const [langUnavOpen, setLangUnavOpen] = useState(false)
    const [isUnavMobileMenuOpen, setIsUnavMobileMenuOpen] = useState(false)
    const [isActive,setIsActive] = useState(1)

    const location = useLocation()

    useEffect(() => {
        setIsUnavMobileMenuOpen(false)
        setThemeUnavOpen(false)
        setLangUnavOpen(false)
    }, [location])

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsUnavMobileMenuOpen(false)
                setThemeUnavOpen(false)
                setLangUnavOpen(false)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isUnavMobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isUnavMobileMenuOpen])
    return (
        <div style={{padding:"1rem"}}>
            <div className="unreg-navbar">
                <div className="settings-navbar-cont">
                    <div className='logo'>
                        <img src={`/images/logo${theme}.png`} alt="" />
                    </div>
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
                        <li className={isActive == 1 ? 'nav-item active' : 'nav-item'}>
                            <Link to={'/currency'} onClick={()=>setIsActive(1)}>
                                Summa
                            </Link>
                        </li>
                        <li  className={isActive == 2 ? 'active' : ''}>
                            <Link to={selPayment == "currency" ? '/cardnumber' : '/crypto'} onClick={()=>setIsActive(2)}>
                                Recipient
                            </Link>
                        </li>
                        <li className={isActive == 3 ? 'active' : ''}>
                            <Link to={'/provider'} onClick={()=>setIsActive(3)}>
                                Payment system
                            </Link>
                        </li>
                        <li className={isActive == 4 ? 'active' : ''}>
                            <Link to={'/instruction'} onClick={()=>setIsActive(4)}>
                                Instructions
                            </Link>
                        </li>

                    </ul>
                    <div className='flex gap-2'>
                        <div className="currency-dropdowns-cont">
                            {/* Theme Dropdown */}
                            <div className="themeDropdown">
                                <button
                                    onClick={() => {
                                        setThemeUnavOpen(!themeUnavOpen)
                                        setLangUnavOpen(false)
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

                                {themeUnavOpen && (
                                    <div className="themeDropdownMenu left-0">
                                        <button
                                            onClick={() => {
                                                if (theme !== 'light') toggleTheme()
                                                setThemeUnavOpen(false)
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
                                                setThemeUnavOpen(false)
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
                                        setLangUnavOpen(!langUnavOpen)
                                        setThemeUnavOpen(false)
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

                                {langUnavOpen && (
                                    <div className="langDropdownMenu">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    handleChange(lang.code)
                                                    setLangUnavOpen(false)
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
                            localStorage.removeItem('pending')
                            if (localStorage.getItem('logged')) {
                                navigate('/transactions')
                            } else {
                                navigate('/')
                            }
                        }}
                        className='logoutBtn'>
                            <img src={`/images/back${theme}.png`} alt="" />
                        </button>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default UnRegNavbar