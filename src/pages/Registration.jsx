import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const Registration = () => {
    let { t, theme, handleChange, languages, currentLang, currentLanguage, toggleTheme, cancelLogin, navigate } = useGlobalContext()
    const [themeRegOpen, setThemeRegOpen] = useState(false)
    const [langRegOpen, setLangRegOpen] = useState(false)
    const [showReg1Psw, setShowReg1Psw] = useState(false)
    const [showReg2Psw, setShowReg2Psw] = useState(false)
    const [mail,setMail] = useState('')
    const [psw,setPsw] = useState('')
    const [accPsw,setAccPsw] = useState('')


    const checkPsw = (rule) =>{
        if(rule == "case" && psw.split('').find((item)=>item == item.toUpperCase())) return true
        if(rule == "length" && psw.split('').length >= 8) return true
        if(rule == "match" && psw === accPsw && accPsw > '') return true
    }

    
    useEffect(()=>{

    },[psw,accPsw])

    return (
        <div className='registration-client' style={{
            width: '100vw',
            height: '100vh',
            background: `url(/images/BG${theme}.png) 100% 0 no-repeat`
        }}>
            <nav className='flex justify-between p-3'>
                <button onClick={() => cancelLogin()} className='logo'>
                    <img src={`/images/logo${theme}.png`} alt="" />
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
                    <input type="text" value={mail} onChange={(e)=>setMail(e.target.value)} />
                    <label htmlFor="">
                        {t("reg-clientForm2")}
                    </label>
                    <div className='login-cont-form-psw'>
                        <input type={showReg1Psw ? "text" : "password"}  value={psw} onChange={(e)=>setPsw(e.target.value)}  />
                        <img src={!showReg1Psw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`} alt="" onClick={() => setShowReg1Psw(!showReg1Psw)} />
                    </div>
                    <div>
                        <div className='pswrule'>
                            <img src={checkPsw("length") ? `/images/ruleDone${theme}.png`:`/images/ruleUdone${theme}.png`} alt="" />
                            <p>
                            {t("reg-clientRule1")}
                            </p>
                        </div>
                        <div className='pswrule'>
                            <img src={checkPsw("case") ? `/images/ruleDone${theme}.png`:`/images/ruleUdone${theme}.png`} alt="" />
                            <p>
                            {t("reg-clientRule2")}
                            </p>
                        </div>
                    </div>
                    <label htmlFor="">
                        {t("reg-clientForm3")}
                    </label>
                    <div className='login-cont-form-psw'>
                        <input type={showReg2Psw ? "text" : "password"} value={accPsw} onChange={(e)=>setAccPsw(e.target.value)}  />
                        <img src={!showReg2Psw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`} alt="" onClick={() => setShowReg2Psw(!showReg2Psw)} />
                    </div>
                    <div className='pswrule'>
                        <img src={checkPsw("match") ? `/images/ruleDone${theme}.png`:`/images/ruleUdone${theme}.png`} alt="" />
                        <p>
                        {t("reg-clientRule3")}
                        </p>
                    </div>
                </div>
                <button className='reg-clientBtn' onClick={async ()=>{
                    if(!mail || !psw || psw !== accPsw){
                      alert('Maʼlumotlarni tekshiring');
                      return;
                    }
                    try{
                      const res = await fetch('/api/auth/register',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({email:mail, password:psw})
                      })
                      const data = await res.json()
                      if(!res.ok){
                        alert(data.message || 'Roʻyxatdan oʻtish xatosi')
                        return
                      }
                      alert('Muvaffaqiyatli roʻyxatdan oʻtdingiz')
                      navigate('/login')
                    }catch(err){
                      alert('Tarmoq xatosi')
                    }
                }}>
                    {t("reg-clientStep1")}
                </button>
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

export default Registration