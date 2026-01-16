import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, Building2, AlertCircle, ChevronRight } from "lucide-react"

const UnRegBankTransfer = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Get transfer data from previous page
  const transferData = location.state || {}

  // Popular banks list (can be expanded)
  const popularBanks = [
    { code: 'KAPITALBANK', name: 'Kapitalbank', country: 'UZ', swift: 'KABORUZ2X' },
    { code: 'ASAKA', name: 'Asaka Bank', country: 'UZ', swift: 'AABORUZ2X' },
    { code: 'NBU', name: 'National Bank of Uzbekistan', country: 'UZ', swift: 'NBUZUZ2X' },
    { code: 'IPAK_YULI', name: 'Ipak Yuli Bank', country: 'UZ', swift: 'IPYOUZ22' },
    { code: 'SBERBANK', name: 'Sberbank', country: 'RU', swift: 'SABRRUMM' },
    { code: 'TINKOFF', name: 'Tinkoff Bank', country: 'RU', swift: 'TICSRUMM' },
    { code: 'OTHER', name: t('otherBank') || 'Boshqa bank', country: '', swift: '' }
  ]

  const [selectedBank, setSelectedBank] = useState(null)
  const [isBankOpen, setIsBankOpen] = useState(false)
  const [customBankName, setCustomBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [iban, setIban] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [termsChecked, setTermsChecked] = useState(false)

  // Auto-fill SWIFT code when bank is selected
  useEffect(() => {
    if (selectedBank && selectedBank.code !== 'OTHER' && selectedBank.swift) {
      setSwiftCode(selectedBank.swift)
    }
  }, [selectedBank])

  // Validate SWIFT code format (8 or 11 characters)
  const validateSwiftCode = (code) => {
    if (!code) return false
    const cleanCode = code.replace(/\s/g, '').toUpperCase()
    return cleanCode.length === 8 || cleanCode.length === 11
  }

  // Validate account number (basic validation)
  const validateAccountNumber = (number) => {
    if (!number) return false
    const cleanNumber = number.replace(/\s/g, '')
    return cleanNumber.length >= 8 && cleanNumber.length <= 34
  }

  const handleContinue = () => {
    if (!accountNumber || !swiftCode || !accountHolderName || !termsChecked) {
      alert(t("fillAllFields") || "Please fill all required fields")
      return
    }

    if (!validateSwiftCode(swiftCode)) {
      alert(t("invalidSwiftCode") || "Invalid SWIFT/BIC code format")
      return
    }

    if (!validateAccountNumber(accountNumber)) {
      alert(t("invalidAccountNumber") || "Invalid account number format")
      return
    }

    // Build bank transfer details for API
    const bankTransferDetails = {
      bankName: selectedBank?.code === 'OTHER' ? customBankName : selectedBank?.name,
      accountNumber: accountNumber.replace(/\s/g, ''),
      swiftCode: swiftCode.replace(/\s/g, '').toUpperCase(),
      iban: iban.replace(/\s/g, '').toUpperCase() || null,
      accountHolderName: accountHolderName.toUpperCase()
    }

    console.log('Continue with bank transfer', bankTransferDetails)

    // Navigate to provider selection or instruction page
    navigate('/provider', {
      state: {
        ...transferData,
        paymentMethod: 'BANK_TRANSFER',
        bankDetails: bankTransferDetails,
        recipient: {
          ...(transferData.recipient || {}),
          bankDetails: bankTransferDetails,
          receiverName: accountHolderName
        }
      }
    })
  }

  const isFormValid = accountNumber && swiftCode && accountHolderName && termsChecked &&
    (selectedBank?.code !== 'OTHER' || customBankName) &&
    validateSwiftCode(swiftCode) && validateAccountNumber(accountNumber)

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
          <h2 style={{ margin: 0 }}>{t("bankTransferDetails") || "Bank o'tkazma ma'lumotlari"}</h2>
        </div>

        <p style={{
          padding: '0 1rem',
          fontSize: '0.9rem',
          opacity: 0.7,
          marginBottom: '1.5rem'
        }}>
          {t("enterBankAccountInfo") || "Qabul qiluvchining bank hisob ma'lumotlarini kiriting"}
        </p>

        <div style={{ padding: '0 1rem' }}>
          {/* Bank Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("selectBank") || "Bankni tanlang"} *
            </label>
            <div className="date-input-container" style={{ padding: 0 }}>
              <button
                onClick={() => setIsBankOpen(!isBankOpen)}
                className="country-select-btn"
                style={{ width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 500 }}>
                      {selectedBank ? selectedBank.name : (t("chooseBank") || "Bankni tanlang")}
                    </div>
                    {selectedBank && selectedBank.swift && (
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>SWIFT: {selectedBank.swift}</div>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  style={{
                    transform: isBankOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              {isBankOpen && (
                <div className="country-dropdown-menu" style={{ position: 'relative', marginTop: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => {
                        setSelectedBank(bank)
                        setIsBankOpen(false)
                      }}
                      className={`country-option ${selectedBank?.code === bank.code ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={18} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{bank.name}</div>
                        {bank.swift && (
                          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>SWIFT: {bank.swift}</div>
                        )}
                      </div>
                      {selectedBank?.code === bank.code && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Bank Name (if OTHER selected) */}
          {selectedBank?.code === 'OTHER' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {t("bankName") || "Bank nomi"} *
              </label>
              <div className="date-input-container">
                <input
                  type="text"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  placeholder={t("enterBankName") || "Bank nomini kiriting"}
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
          )}

          {/* Account Holder Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("accountHolderName") || "Hisob egasi ismi"} *
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder={t("enterAccountHolderName") || "To'liq ismni kiriting"}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          {/* Account Number */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("accountNumber") || "Hisob raqami"} *
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={t("enterAccountNumber") || "Hisob raqamini kiriting"}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            {accountNumber && !validateAccountNumber(accountNumber) && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {t("invalidAccountFormat") || "Noto'g'ri hisob raqami formati"}
              </p>
            )}
          </div>

          {/* SWIFT/BIC Code */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("swiftCode") || "SWIFT/BIC kodi"} *
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX yoki XXXXXXXXXXX"
                maxLength={11}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              />
            </div>
            {swiftCode && !validateSwiftCode(swiftCode) && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {t("invalidSwiftFormat") || "SWIFT kodi 8 yoki 11 belgidan iborat bo'lishi kerak"}
              </p>
            )}
          </div>

          {/* IBAN (Optional) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("iban") || "IBAN"} ({t("optional") || "ixtiyoriy"})
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                placeholder="UZ00 0000 0000 0000 0000 0000"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          {/* Warning */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '1rem',
            marginBottom: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <AlertCircle size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
              {t("bankTransferWarning") || "Bank o'tkazmasi 1-3 ish kuni davom etishi mumkin. Iltimos, barcha ma'lumotlarni to'g'ri kiriting."}
            </p>
          </div>

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="terms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem', marginTop: '2px', flexShrink: 0 }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {t("confirmBankDetails") || "Men bank ma'lumotlari to'g'ri ekanligini tasdiqlayman"}
            </label>
          </div>

          {/* Continue Button */}
          <button
            className="currency-continueBtn"
            onClick={handleContinue}
            disabled={!isFormValid}
            style={{
              opacity: !isFormValid ? 0.5 : 1
            }}
          >
            {t('continue') || "Davom etish"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnRegBankTransfer
