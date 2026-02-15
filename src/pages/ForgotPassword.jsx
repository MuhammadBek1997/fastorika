import { useState, useRef, useEffect } from 'react'
import { useGlobalContext } from '../Context'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'
import { useNotification } from '../components/Notification'

const ForgotPassword = () => {
    const { t, theme, toggleTheme, handleChange, currentLang, currentLanguage, languages, cancelLogin } = useGlobalContext()
    const notify = useNotification()

    const [themeOpen, setThemeOpen] = useState(false)
    const [langOpen, setLangOpen] = useState(false)

    // Steps: 'email' → 'code' → 'done'
    const [step, setStep] = useState('email')
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Code step
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const inputsRef = useRef([])
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isShowPsw, setIsShowPsw] = useState(false)
    const [isShowConfirm, setIsShowConfirm] = useState(false)
    const [error, setError] = useState('')

    // Countdown
    const [countdown, setCountdown] = useState(0)
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true)
            return
        }
        const id = setInterval(() => setCountdown(c => c - 1), 1000)
        return () => clearInterval(id)
    }, [countdown])

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    // Password validation
    const hasMinLength = newPassword.length >= 8
    const hasUppercase = /[A-Z]/.test(newPassword)
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword

    // Step 1: Send reset code
    const handleSendCode = async () => {
        if (!email?.trim()) {
            notify.error(t('forgot.enterEmail') || 'Введите Email')
            return
        }
        try {
            setSubmitting(true)
            const res = await apiFetch('auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                notify.error(data?.message || t('forgot.sendError') || 'Ошибка отправки')
                return
            }
            notify.success(t('forgot.codeSent') || 'Код отправлен на почту')
            setStep('code')
            setCountdown(600)
            setCanResend(false)
            setTimeout(() => inputsRef.current[0]?.focus(), 100)
        } catch (err) {
            notify.error(t('forgot.sendError') || 'Ошибка отправки')
        } finally {
            setSubmitting(false)
        }
    }

    // Code input handlers
    const handleCodeChange = (index, value) => {
        setError('')
        const cleanValue = value.replace(/\D/g, '')
        if (cleanValue.length > 1) {
            const pastedDigits = cleanValue.slice(0, 6).split('')
            const newDigits = [...digits]
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pastedDigits[i] || ''
            }
            setDigits(newDigits)
            const lastIndex = Math.min(pastedDigits.length, 6) - 1
            if (lastIndex >= 0) inputsRef.current[lastIndex]?.focus()
            return
        }
        const v = cleanValue.slice(0, 1)
        const next = [...digits]
        next[index] = v
        setDigits(next)
        if (v && index < 5) inputsRef.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pastedData.length > 0) {
            const newDigits = [...digits]
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pastedData[i] || ''
            }
            setDigits(newDigits)
            setError('')
            const lastIndex = Math.min(pastedData.length, 6) - 1
            if (lastIndex >= 0) inputsRef.current[lastIndex]?.focus()
        }
    }

    const code = digits.join('')

    // Step 2: Reset password
    const handleResetPassword = async () => {
        if (code.length !== 6) {
            setError(t('forgot.invalidCode') || 'Введите 6-значный код')
            return
        }
        if (!hasMinLength || !hasUppercase) {
            setError(t('passwordRequirements') || 'Пароль не соответствует требованиям')
            return
        }
        if (!passwordsMatch) {
            setError(t('forgot.passwordsMismatch') || 'Пароли не совпадают')
            return
        }

        try {
            setSubmitting(true)
            const res = await apiFetch('auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    resetCode: code,
                    newPassword
                })
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.message || t('forgot.resetError') || 'Ошибка сброса пароля')
                return
            }
            notify.success(t('forgot.resetSuccess') || 'Пароль успешно изменён')
            setStep('done')
        } catch (err) {
            setError(t('forgot.resetError') || 'Ошибка сброса пароля')
        } finally {
            setSubmitting(false)
        }
    }

    // Resend code
    const handleResend = async () => {
        if (!canResend) return
        try {
            const res = await apiFetch('auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            })
            if (!res.ok) throw new Error()
            notify.success(t('forgot.codeSent') || 'Код отправлен на почту')
            setCountdown(600)
            setCanResend(false)
            setDigits(['', '', '', '', '', ''])
            inputsRef.current[0]?.focus()
        } catch {
            notify.error(t('forgot.sendError') || 'Ошибка отправки')
        }
    }

    return (
        <div className='login-client' style={{
            width: '100vw',
            height: '100vh',
            background: `url(/images/BG${theme}.png) 100% 0 no-repeat`,
            backgroundSize: "cover"
        }}>
            <nav className='fixed flex justify-between p-5'>
                <button onClick={() => cancelLogin()} className='logo'>
                    <img src={`/images/logo${theme}.svg`} alt="" />
                </button>
                <div className="dropdowns-cont" style={{ top: "1rem" }}>
                    {/* Theme Dropdown */}
                    <div className="themeDropdown">
                        <button
                            onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false) }}
                            className="themeToggle"
                            aria-label="Theme menu"
                        >
                            {theme === 'light' ? (
                                <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                            )}
                            <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                        </button>
                        {themeOpen && (
                            <div className="themeDropdownMenu">
                                <button onClick={() => { if (theme !== 'light') toggleTheme(); setThemeOpen(false) }} className={`themeOption ${theme === 'light' ? 'active' : ''}`}>
                                    <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                                    <span>Light</span>
                                </button>
                                <button onClick={() => { if (theme !== 'dark') toggleTheme(); setThemeOpen(false) }} className={`themeOption ${theme === 'dark' ? 'active' : ''}`}>
                                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                                    <span>Dark</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Language Dropdown */}
                    <div className="langDropdown">
                        <button
                            onClick={() => { setLangOpen(!langOpen); setThemeOpen(false) }}
                            className="langToggle"
                            aria-label="Language menu"
                        >
                            <img src={currentLang.flag} alt="" className="langImg" />
                            <span className="langCode">{currentLang.code.toUpperCase()}</span>
                            <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" /></svg>
                        </button>
                        {langOpen && (
                            <div className="langDropdownMenu">
                                {languages.map((lang) => (
                                    <button key={lang.code} onClick={() => { handleChange(lang.code); setLangOpen(false) }} className={`langOption ${currentLanguage === lang.code ? 'active' : ''}`}>
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
                {/* Step 1: Email */}
                {step === 'email' && (
                    <>
                        <h1>{t('forgot.title')}</h1>
                        <div className='login-cont-top'>
                            <p>{t('forgot.desc')}</p>
                        </div>
                        <div className='login-cont-form'>
                            <label>{t('login-clientForm1')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                            />
                        </div>
                        <button
                            className='login-clientBtn'
                            onClick={handleSendCode}
                            disabled={submitting}
                        >
                            {submitting ? (t('forgot.sending') || '...') : (t('forgot.sendCode'))}
                        </button>
                        <Link to='/login' style={{ color: "#348BDC" }}>
                            {t('forgot.backToLogin')}
                        </Link>
                    </>
                )}

                {/* Step 2: Code + New Password */}
                {step === 'code' && (
                    <>
                        <h1>{t('forgot.resetTitle')}</h1>
                        <div className='login-cont-top'>
                            <p>{t('forgot.codeDesc')} <strong>{email}</strong></p>
                        </div>

                        <div className='login-cont-form'>
                            <label>{t('forgot.enterCode')}</label>
                            <div className="verify-code-inputs" style={{ justifyContent: 'flex-start' }}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => inputsRef.current[i] = el}
                                        value={d}
                                        onChange={(e) => handleCodeChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={handlePaste}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="one-time-code"
                                        className={`verify-code-input ${error ? 'error' : ''}`}
                                    />
                                ))}
                            </div>

                            {!canResend && countdown > 0 && (
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    {t('forgot.resendIn') || 'Повторная отправка через'} {formatTime(countdown)}
                                </p>
                            )}
                            {canResend && (
                                <a
                                    onClick={handleResend}
                                    role="button"
                                    style={{ color: "#348BDC", cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    {t('forgot.resendCode') || 'Отправить код повторно'}
                                </a>
                            )}

                            <label>{t('forgot.newPassword')}</label>
                            <div className='login-cont-form-psw'>
                                <input
                                    type={isShowPsw ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                                />
                                <img
                                    src={!isShowPsw ? `/images/visible${theme}.png` : `/images/hide${theme}.png`}
                                    alt=""
                                    onClick={() => setIsShowPsw(!isShowPsw)}
                                />
                            </div>

                            <label>{t('forgot.confirmPassword')}</label>
                            <div className='login-cont-form-psw'>
                                <input
                                    type={isShowConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                />
                                <img
                                    src={!isShowConfirm ? `/images/visible${theme}.png` : `/images/hide${theme}.png`}
                                    alt=""
                                    onClick={() => setIsShowConfirm(!isShowConfirm)}
                                />
                            </div>

                            {/* Password rules */}
                            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <span style={{ color: hasMinLength ? '#00D796' : 'inherit', opacity: hasMinLength ? 1 : 0.5 }}>
                                    {hasMinLength ? '✓' : '○'} {t('reg-clientRule1')}
                                </span>
                                <span style={{ color: hasUppercase ? '#00D796' : 'inherit', opacity: hasUppercase ? 1 : 0.5 }}>
                                    {hasUppercase ? '✓' : '○'} {t('reg-clientRule2')}
                                </span>
                                <span style={{ color: passwordsMatch ? '#00D796' : 'inherit', opacity: passwordsMatch ? 1 : 0.5 }}>
                                    {passwordsMatch ? '✓' : '○'} {t('reg-clientRule3')}
                                </span>
                            </div>
                        </div>

                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{error}</p>}

                        <button
                            className='login-clientBtn'
                            onClick={handleResetPassword}
                            disabled={submitting || code.length !== 6 || !hasMinLength || !hasUppercase || !passwordsMatch}
                            style={{ opacity: (code.length !== 6 || !hasMinLength || !hasUppercase || !passwordsMatch) ? 0.5 : 1 }}
                        >
                            {submitting ? '...' : t('forgot.resetBtn')}
                        </button>
                        <Link to='/login' style={{ color: "#348BDC" }}>
                            {t('forgot.backToLogin')}
                        </Link>
                    </>
                )}

                {/* Step 3: Success */}
                {step === 'done' && (
                    <>
                        <h1>{t('forgot.successTitle')}</h1>
                        <div className='login-cont-top'>
                            <p>{t('forgot.successDesc')}</p>
                        </div>
                        <Link to='/login'>
                            <button className='login-clientBtn' style={{ marginTop: '1rem' }}>
                                {t('login')}
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
