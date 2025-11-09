import { useEffect, useRef, useState } from "react"
import { useGlobalContext } from "../Context"
import { apiFetch } from "../api"
import { toast } from "react-toastify"

const VerifyModal = ({ email, onClose }) => {
  const { t, theme } = useGlobalContext()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputsRef = useRef([])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('') // Add error state
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

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
    const v = value.replace(/\D/g, '').slice(0, 1)
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

  const code = digits.join('')

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t('toast.verification.error')) // Set error instead of toast
      return
    }
    try {
      setSubmitting(true)
      const res = await apiFetch('auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      if (!res.ok) throw new Error('Verify error')
      toast.success(t('toast.verification.success'))
      onClose?.()
    } catch (err) {
      setError(t('toast.verification.error')) // Set error instead of toast
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

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
      toast.success(t('toast.verification.resent') || 'Code resent')
      setCountdown(60)
      setCanResend(false)
      setDigits(['','','','','',''])
      inputsRef.current[0]?.focus()
    } catch (err) {
      toast.error(t('toast.verification.error') || 'Resend failed')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="addCardModal" data-theme={theme}>
      <div className="addCardModal-cont verify-modal-cont">
        <div className="verify-modal-header">
          <h2>{t('verifyModal.title')}</h2>
          <button className='verify-modal-close' onClick={onClose} aria-label={t('verifyModal.close')}>
            <img src={`/images/back${theme}.png`} alt="close" />
          </button>
        </div>
        
        <div className="verify-modal-body">
          <p className="verify-modal-desc">
            {t('verifyModal.desc')} <strong>{maskEmail(email) || t('verifyModal.unknownEmail')}</strong>
          </p>
          {!canResend && (
            <p className="verify-modal-countdown">
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
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
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