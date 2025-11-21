import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, User, Phone, CreditCard, AlertCircle } from "lucide-react"

const UnRegCryp = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [nameWarningChecked, setNameWarningChecked] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 12) {
      setPhoneNumber(value)
    }
  }

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value
    if (value.length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleContinue = () => {
    if (!fullName || !phoneNumber || !cardNumber || !nameWarningChecked || !termsChecked) {
      alert(t("fillAllFields"))
      return
    }
    console.log('Continue with card payment', { fullName, phoneNumber, cardNumber })
    // Navigate to next step
  }

  return (
    <div className="currency">
      <div className="currency-body">
        <div className="currency-head" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 style={{ margin: 0 }}>{t("recipientDetails")}</h2>
        </div>

        <p style={{ 
          padding: '0 1rem', 
          fontSize: '0.9rem',
          opacity: 0.7,
          marginBottom: '1.5rem'
        }}>
          {t("fillRecipientInfo")}
        </p>

        <div style={{ padding: '0 1rem' }}>
          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("recipientFullName")}
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullName")}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("phoneNumber")}
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder={t('addCardModal.placeholders.phoneNumber') || t('placeholders.phone')}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Card Number */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("cardNumber")}
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder={t('addCardModal.placeholders.cardNumber') || t('placeholders.cardNumber')}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Name Warning */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: '1rem',
            marginBottom: '1rem',
            backgroundColor: theme === 'dark' ? 'var(--bg-body-dark)' : 'var(--bg-body-light)'
          }}>
            <AlertCircle size={18} />
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{t("nameWarningMessage")}</p>
          </div>

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="terms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {t("confirmRecipient")} <span style={{ color: '#00D796' }}>{t("verified")}</span> {t("and")} <span style={{ color: '#00D796' }}>{t("trusted")}</span> {t("person")}
            </label>
          </div>

          {/* Continue Button */}
          <button
            className="currency-continueBtn"
            onClick={handleContinue}
            disabled={!fullName || !phoneNumber || !cardNumber || !termsChecked}
          >
            {t('continue')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnRegCryp