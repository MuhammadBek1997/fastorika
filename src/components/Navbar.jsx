import { Link } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { useEffect, useState } from "react"

const Navbar = () => {
    const { theme, toggleTheme, currentLanguage, handleChange, t } = useGlobalContext()
    const [isThemeOpen, setIsThemeOpen] = useState(false)
    const [isLangOpen, setIsLangOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


    // Navbar komponenti ichida, useState lardan keyin:
    const [isScrolled, setIsScrolled] = useState(false)

    // useEffect qo'shing
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Language options
    const languages = [
        { code: 'ru', name: 'Русский', flag: '/images/russia.png' },
        { code: 'en', name: 'English', flag: '/images/us.png' }
    ]

    const currentLang = languages.find(lang => lang.code === currentLanguage)

    return (
        <nav className={`sticky w-full z-20 top-0 start-0 ${isScrolled ? 'scrolled' : ''}`} style={{ background: isMobileMenuOpen && theme == "light" ? "#F0F0F0" : isMobileMenuOpen && theme == "dark" ? "#363636" : null, height: isMobileMenuOpen ? "100%" : null, marginTop: isMobileMenuOpen ? "0" : null, borderRadius: isMobileMenuOpen ? "0" : null }} >
            <div className="max-w-screen-xxl flex flex-wrap items-center justify-between mx-auto p-4">
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden"
                        aria-controls="navbar-sticky"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    <Link to={'/'} className="logo">
                        <img src={`/images/logo${theme}.png`} className="h-8" alt="Logo" />
                    </Link>

                </div>

                <div className="flex md:order-2 items-center space-x-3 md:space-x-0 rtl:space-x-reverse">

                    {!isMobileMenuOpen && <button type="button" className="loginBtn">{t("login")}</button>}

                </div>

                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} items-center justify-end w-full md:flex md:w-auto md:order-1`} style={{ marginTop: isMobileMenuOpen ? "1rem" : null, width: isMobileMenuOpen ? "100%" : null, borderRadius: isMobileMenuOpen ? "1rem" : null }} id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 gap-3 font-medium rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
                        <li>
                            <a href="" className="block" aria-current="page">{t("faq")}</a>
                        </li>
                        <li>
                            <Link to={'/'} className="block">
                                {t("aboutUs")}
                            </Link>
                        </li>
                    </ul>
                    <div className="dropdowns-cont" style={{ top: "1rem" }}>
                        {/* Theme Dropdown */}
                        <div className="themeDropdown">
                            <button
                                onClick={() => {
                                    setIsThemeOpen(!isThemeOpen)
                                    setIsLangOpen(false)
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

                            {isThemeOpen && (
                                <div className="themeDropdownMenu">
                                    <button
                                        onClick={() => {
                                            if (theme !== 'light') toggleTheme()
                                            setIsThemeOpen(false)
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
                                            setIsThemeOpen(false)
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
                                    setIsLangOpen(!isLangOpen)
                                    setIsThemeOpen(false)
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

                            {isLangOpen && (
                                <div className="langDropdownMenu">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                handleChange(lang.code)
                                                setIsLangOpen(false)
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
                </div>
            </div>
        </nav>
    )
}

export default Navbar
