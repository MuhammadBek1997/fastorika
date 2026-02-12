import { useEffect, useRef, useState } from "react"
import { useGlobalContext } from "../Context"
import { apiFetch } from "../api"
import { useNotification } from '../components/Notification'
import { X, Clock, Mail } from "lucide-react"

const VerifyModal = ({ email, onClose, initialCode }) => {
  const { t, theme } = useGlobalContext()
  const notify = useNotification()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef([])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(600) // 10 daqiqa = 600 sekund
  const [canResend, setCanResend] = useState(false)
  const autoVerifyTriggered = useRef(false)

  const maskEmail = (e) => {
    try {
      const [name, domain] = String(e || '').split('@')
      if (!name || !domain) return e || ''
      const visible = name.slice(0, 5)
      return `${visible}${name.length > 5 ? '*****' : ''}@${domain}`
    } catch { return e || '' }
  }

  const handleChange = (index, value) => {
    setError('') // Clear error on input

    // Faqat raqamlarni olish
    const cleanValue = value.replace(/\D/g, '')

    // Agar 1 dan ko'p raqam bo'lsa - paste qilingan (fallback)
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split('')
      const newDigits = [...digits]
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || ''
      }
      setDigits(newDigits)
      // Oxirgi to'ldirilgan inputga focus
      const lastIndex = Math.min(pastedDigits.length, 6) - 1
      if (lastIndex >= 0) {
        inputsRef.current[lastIndex]?.focus()
      }
      return
    }

    // Oddiy bitta raqam kiritish
    const v = cleanValue.slice(0, 1)
    const next = [...digits]
    next[index] = v
    setDigits(next)
    if (v && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  // Paste handler - 6 talik kodni to'liq paste qilish uchun
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
      // Oxirgi to'ldirilgan inputga focus
      const lastIndex = Math.min(pastedData.length, 6) - 1
      if (lastIndex >= 0) {
        inputsRef.current[lastIndex]?.focus()
      }
    }
  }

  const code = digits.join('')

  // Umumiy verify funksiyasi
  const doVerify = async (verificationCode) => {
    try {
      setSubmitting(true)
      const res = await apiFetch('auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode })
      })
      if (!res.ok) throw new Error('Verify error')
      const data = await res.json().catch(() => ({}))
      notify.success(t('notify.verification.success'))
      onClose?.(data)
    } catch (err) {
      setError(t('notify.verification.error'))
      setSubmitting(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t('notify.verification.error'))
      return
    }
    await doVerify(code)
  }

  useEffect(() => {
    // Agar initialCode mavjud bo'lsa, inputlarni to'ldirish
    if (initialCode && initialCode.length === 6 && !autoVerifyTriggered.current) {
      const codeDigits = initialCode.split('')
      setDigits(codeDigits)
      autoVerifyTriggered.current = true
      // 1 sekunddan keyin avtomatik tasdiqlash
      const timer = setTimeout(() => doVerify(initialCode), 1000)
      return () => clearTimeout(timer)
    } else {
      inputsRef.current[0]?.focus()
    }
  }, [initialCode])

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [countdown])

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleResend = async () => {
    if (!canResend || resending) return
    try {
      setResending(true)
      const res = await apiFetch('auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error('Resend error')
      notify.success(t('notify.verification.resent') || 'Code resent')
      setCountdown(600) // 10 daqiqa
      setCanResend(false)
      setDigits(['','','','','',''])
      inputsRef.current[0]?.focus()
    } catch (err) {
      notify.error(t('notify.verification.error') || 'Resend failed')
    } finally {
      setResending(false)
    }
  }

  const currentTheme = theme || 'light'

  return (
    <div className="addCardModal" data-theme={currentTheme} style={{
      background:`url(/images/BG${currentTheme}.png) 100% 0px no-repeat,${currentTheme==="light" ? "#FFFFFF" : "#5B5B5B"}`
    }}>
      <div className="addCardModal-cont verify-modal-cont">
        <div className="verify-modal-header">
          <h2>{t('verifyModal.title')}</h2>
          <button className='verify-modal-close' onClick={onClose} aria-label={t('verifyModal.close')}>
            <X size={18} />
          </button>
        </div>
        
        <div className="verify-modal-body">
          <p className="verify-modal-desc verify-inline">
            <span className="verify-inline-icon"><Mail size={16} /></span>
            {t('verifyModal.desc')} <strong>{maskEmail(email) || t('verifyModal.unknownEmail')}</strong>
          </p>
          {!canResend && (
            <p className="verify-modal-countdown verify-inline">
              <span className="verify-inline-icon"><Clock size={16} /></span>
              {(t('verifyModal.resendAvailableIn') || 'Получить новый можно через')} {formatTime(countdown)}
            </p>
          )}
          
          
          <div className="verify-code-inputs">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                className={`verify-code-input ${error ? 'error' : ''}`}
              />
            ))}
          </div>
          
          {error && <p className="verify-error-msg">{error}</p>}
          
          <button 
            type="button" 
            disabled={submitting || code.length !== 6} 
            onClick={handleVerify} 
            className="verify-submit-btn"
          >
            {t('verifyModal.confirm')}
          </button>
          <a 
            onClick={handleResend} 
            className={`verify-modal-resend ${!canResend ? 'disabled' : ''}`}
            role="button"
            aria-disabled={!canResend}
          >
            {canResend ? (t('verifyModal.resend') || 'Отправить снова') : (t('verifyModal.wait') || 'Подождите')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default VerifyModal