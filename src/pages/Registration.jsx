import { useEffect, useState } from 'react'
import './registration.css'
import { Link, useLocation } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { apiFetch } from '../api'
import { toast } from 'react-toastify'
import VerifyModal from './VerifyModal'

const Registration = () => {
    let {
        t,
        theme,
        handleChange,
        languages,
        currentLang,
        currentLanguage,
        toggleTheme,
        cancelLogin,
        navigate,
        handleGoogleLogin,
        handleAppleLogin
    } = useGlobalContext()
    
    const location = useLocation()
    const [themeRegOpen, setThemeRegOpen] = useState(false)
    const [langRegOpen, setLangRegOpen] = useState(false)
    const [showReg1Psw, setShowReg1Psw] = useState(false)
    const [showReg2Psw, setShowReg2Psw] = useState(false)
    const [mail, setMail] = useState('')
    const [phone, setPhone] = useState('')
    const [psw, setPsw] = useState('')
    const [accPsw, setAccPsw] = useState('')
    const [showVerifyModal, setShowVerifyModal] = useState(false)

    // Country codes for phone input
    const countryCodes = [
        { code: '+998', country: 'UZ', flag: '🇺🇿', name: 'Uzbekistan' },
        { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
        { code: '+7', country: 'KZ', flag: '🇰🇿', name: 'Kazakhstan' },
        { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA' },
        { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK' },
        { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
        { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
        { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
        { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
        { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' }
    ]
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
    const [phoneCode, setPhoneCode] = useState('+998')

    // Google/Apple dan kelgan ma'lumotlarni olish
    useEffect(() => {
        if (location.state) {
            setMail(location.state.email || '')
            
            // Agar Google/Apple dan kelgan bo'lsa, verification modal ochish
            if (location.state.needsVerification) {
                setShowVerifyModal(true)
            }
        }
    }, [location.state])

    const checkPsw = (rule) => {
        if (rule == "case" && /[A-Z]/.test(psw)) return true
        if (rule == "length" && psw.length >= 8) return true
        if (rule == "match" && psw === accPsw && accPsw > '') return true
    }

    const isFormValid = mail && phone && checkPsw("length") && checkPsw("case") && checkPsw("match")

    let forNum = new Date().getTime()

    // Verification modal yopilganda avtomatik login
    const handleVerifyClose = (responseData) => {
        setShowVerifyModal(false)

        // verify-email javobidan token olish
        const data = responseData?.data || responseData
        if (data?.accessToken) {
            sessionStorage.setItem('token', data.accessToken)
            localStorage.setItem('token', data.accessToken)
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
            if (data.tokenType) localStorage.setItem('tokenType', data.tokenType)
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('logged', 'true')
            window.location.href = '/transactions'
            return
        }

        navigate('/login')
    }

    return (
        <div className='registration-client' style={{
            width: '100vw',
            height: '100vh',
            background: `url(/images/BG${theme}.png) 100% 0 no-repeat`
        }}>
            <nav className='flex justify-between p-3'>
                <button onClick={() => cancelLogin()} className='logo'>
                    <img src={`/images/logo${theme}.svg`} alt="" />
                </button>
                <div className="dropdowns-cont" style={{ top: "1rem" }}>
                    {/* Theme Dropdown */}
                    <div className="themeDropdown">
                        <button
                            onClick={() => {
                                setThemeRegOpen(!themeRegOpen)
                                setLangRegOpen(false)
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

                        {themeRegOpen && (
                            <div className="themeDropdownMenu">
                                <button
                                    onClick={() => {
                                        if (theme !== 'light') toggleTheme()
                                        setThemeRegOpen(false)
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
                                        setThemeRegOpen(false)
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
                                setLangRegOpen(!langRegOpen)
                                setThemeRegOpen(false)
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

                        {langRegOpen && (
                            <div className="langDropdownMenu">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            handleChange(lang.code)
                                            setLangRegOpen(false)
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
            
            <div className='registration-cont'>
                {/* Google/Apple dan kelgan notification */}
                {(location.state?.fromGoogle || location.state?.fromApple) && (
                    <div style={{
                        background: '#e3f2fd',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#1976d2', fontSize: '14px', margin: 0 }}>
                            ✓ {location.state?.fromGoogle ? 'Google' : 'Apple'} ma'lumotlari olindi
                        </p>
                        {location.state?.needsVerification && (
                            <p style={{ color: '#1565c0', fontSize: '13px', margin: '4px 0 0 0' }}>
                                📧 Tasdiqlash kodi emailingizga yuborildi
                            </p>
                        )}
                    </div>
                )}
                
                <h1>
                    {t("reg-client")}
                </h1>
                <div className='login-cont-top'>
                    <p>
                        {t("reg-clientToptext")}
                    </p>
                    <Link to={'/login'} style={{ color: "#348BDC" }}>
                        {t("login")}
                    </Link>
                </div>
                <div className='registration-cont-form'>
                    <label htmlFor="">
                        {t("login-clientForm1")}
                    </label>
                    <input
                        type="text"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        disabled={location.state?.fromGoogle || location.state?.fromApple}
                    />
                    <label htmlFor="">
                        {t("phoneNumber") || "Номер телефона"}
                    </label>
                    <div className="phone-input-container">
                        {/* Country Flag Dropdown Button */}
                        <button
                            type="button"
                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            className={`phone-country-btn ${isCountryDropdownOpen ? 'open' : ''}`}
                        >
                            <img className="flag" src={`https://flagcdn.com/w40/${selectedCountry.country.toLowerCase()}.png`} alt="" />
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* Country Dropdown Menu */}
                        {isCountryDropdownOpen && (
                            <div className="phone-dropdown">
                                {countryCodes.map((country, idx) => (
                                    <button
                                        key={`${country.code}-${country.country}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                            setSelectedCountry(country)
                                            setPhoneCode(country.code)
                                            setIsCountryDropdownOpen(false)
                                        }}
                                        className={`phone-dropdown-item ${selectedCountry.code === country.code && selectedCountry.country === country.country ? 'active' : ''}`}
                                    >
                                        <img className="flag" src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} alt="" />
                                        <span className="name">{country.name}</span>
                                        <span className="dial-code">{country.code}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Editable Code Input */}
                        <input
                            type="text"
                            className="phone-code-input"
                            value={phoneCode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9+]/g, '')
                                setPhoneCode(val)
                                const match = countryCodes.find(c => c.code === val)
                                if (match) setSelectedCountry(match)
                            }}
                            placeholder="+998"
                        />

                        {/* Phone Number Input */}
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="90 123 45 67"
                        />
                    </div>
                    <label htmlFor="">
                        {t("reg-clientForm2")}
                    </label>
                    <div className='login-cont-form-psw'>
                        <input type={showReg1Psw ? "text" : "password"} value={psw} onChange={(e) => setPsw(e.target.value)} />
                        <img src={!showReg1Psw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`} alt="" onClick={() => setShowReg1Psw(!showReg1Psw)} />
                    </div>
                    <div>
                        <div className='pswrule'>
                            <img src={checkPsw("length") ? `/images/ruleDone${theme}.png` : `/images/ruleUdone${theme}.png`} alt="" />
                            <p>
                                {t("reg-clientRule1")}
                            </p>
                        </div>
                        <div className='pswrule'>
                            <img src={checkPsw("case") ? `/images/ruleDone${theme}.png` : `/images/ruleUdone${theme}.png`} alt="" />
                            <p>
                                {t("reg-clientRule2")}
                            </p>
                        </div>
                    </div>
                    <label htmlFor="">
                        {t("reg-clientForm3")}
                    </label>
                    <div className='login-cont-form-psw'>
                        <input type={showReg2Psw ? "text" : "password"} value={accPsw} onChange={(e) => setAccPsw(e.target.value)} />
                        <img src={!showReg2Psw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`} alt="" onClick={() => setShowReg2Psw(!showReg2Psw)} />
                    </div>
                    <div className='pswrule'>
                        <img src={checkPsw("match") ? `/images/ruleDone${theme}.png` : `/images/ruleUdone${theme}.png`} alt="" />
                        <p>
                            {t("reg-clientRule3")}
                        </p>
                    </div>
                </div>
                
                {/* Agar Google/Apple dan kelgan bo'lsa, faqat verify button ko'rsatish */}
                {(location.state?.fromGoogle || location.state?.fromApple) ? (
                    <button 
                        className='reg-clientBtn' 
                        onClick={() => setShowVerifyModal(true)}
                    >
                        Emailni tasdiqlash
                    </button>
                ) : (
                    <button className='reg-clientBtn' disabled={!isFormValid} onClick={async () => {
                        try {
                            // Validate password
                            if (!checkPsw("length") || !checkPsw("case") || !checkPsw("match")) {
                                toast.error(t('passwordRequirements') || 'Parol talablariga javob bermaydi')
                                return
                            }

                            if (!mail) {
                                toast.error(t('enterEmail') || 'Email kiriting')
                                return
                            }

                            if (!phone) {
                                toast.error(t('enterPhone') || 'Telefon raqamini kiriting')
                                return
                            }

                            // Call backend /auth/register endpoint
                            const response = await apiFetch('auth/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    email: mail,
                                    password: psw,
                                    name: mail.split('@')[0] || 'User',
                                    phone: `${phoneCode}${phone}`
                                })
                            })

                            const responseData = await response.json()

                            if (!response.ok) {
                                const errorMessage = responseData?.message || responseData?.error || 'Registration failed'
                                toast.error(errorMessage)
                                return
                            }

                            // Backend returns: { success: true, data: {}, timestamp: ... }
                            // Data might be empty object, that's okay - user is created and verification email sent
                            if (responseData.success) {
                                toast.success(t('registrationSuccess') || 'Ro\'yxatdan o\'tdingiz! Email tasdiqlash kerak.')

                                // Show verification modal
                                setShowVerifyModal(true)
                            } else {
                                console.error('Registration failed: success is false')
                                toast.error(responseData?.message || 'Registration failed')
                            }
                        } catch (err) {
                            console.error('Registration error:', err)
                            toast.error(t('registrationError') || 'Ro\'yxatdan o\'tishda xatolik')
                        }
                    }}>
                        {t("reg-clientStep1")}
                    </button>
                )}
                
                {/* <div className='login-or'>
                    <hr />
                    <p>
                        {t("or")}
                    </p>
                </div> */}
                {/* <div className='login-clientProviders'>
                    
                    <button onClick={handleGoogleLogin} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <img src="/images/Google.png" alt="" />
                        {t("login-clientwithG")}
                    </button>
                    
                    <button onClick={handleAppleLogin} style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <img src={`/images/apple${theme}.png`} alt="" />
                        {t("login-clientwithA")}
                    </button>
                </div> */}
            </div>
            
            {showVerifyModal && (
                <VerifyModal 
                    email={mail} 
                    onClose={handleVerifyClose}
                />
            )}
        </div>
    )
}

export default Registration