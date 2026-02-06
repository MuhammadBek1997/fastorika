import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, Building2, AlertCircle, ChevronRight, ArrowRight } from "lucide-react"
import { toast } from "react-toastify"

const UnRegBankTransfer = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Get transfer data from previous page
  const transferData = location.state || {}

  // Extract transfer summary from previous page
  const {
    sendAmount = '0',
    receiveAmount = '0',
    fromCurrency = 'USD',
    toCurrency = 'UZS',
    exchangeRate = null,
    feeCalculation = null,
    transferFeePercentage = 10,
    exchangeRateFeePercentage = 2
  } = transferData

  // O'zbekiston banklari
  const uzbekBanks = [
    { code: 'NBU', name: "O'zmilliybank (NBU)", country: 'UZ', swift: 'NBFAUZ2X' },
    { code: 'SQB', name: "O'zsanoatqurilishbank (SQB)", country: 'UZ', swift: 'UZHOUZ22' },
    { code: 'XALQ', name: 'Xalq Banki', country: 'UZ', swift: 'XACAUZ22' },
    { code: 'KAPITALBANK', name: 'Kapitalbank', country: 'UZ', swift: 'KACHUZ22' },
    { code: 'IPOTEKA', name: 'Ipoteka Bank', country: 'UZ', swift: 'IPBKUZ22' },
    { code: 'HAMKOR', name: 'Hamkorbank', country: 'UZ', swift: 'HAMKUZ22' },
    { code: 'ASAKA', name: 'Asaka Bank', country: 'UZ', swift: 'ASBKUZ22' },
    { code: 'AGROBANK', name: 'Agrobank', country: 'UZ', swift: 'PAKHUZ22' },
    { code: 'OFB', name: 'Orient Finans Bank', country: 'UZ', swift: 'ORFBUZ22' },
  ]

  // Rossiya banklari
  const russiaBanks = [
    { code: 'SBERBANK', name: 'Sberbank (Сбербанк)', country: 'RU', swift: 'SABRRUMM' },
    { code: 'VTB', name: 'VTB Bank (ВТБ)', country: 'RU', swift: 'VTBRRUMM' },
    { code: 'GAZPROM', name: 'Gazprombank (Газпромбанк)', country: 'RU', swift: 'GAZPRUMM' },
    { code: 'ALFA', name: 'Alfa-Bank (Альфа-Банк)', country: 'RU', swift: 'ALFARUMM' },
    { code: 'ROSSIYA', name: 'Bank Rossiya (Банк Россия)', country: 'RU', swift: 'ROSYRU2P' },
    { code: 'TINKOFF', name: 'Tinkoff Bank (Тинькофф)', country: 'RU', swift: 'TICSRUMM' },
  ]

  const popularBanks = [
    ...uzbekBanks,
    ...russiaBanks,
    { code: 'OTHER', name: t('otherBank') || 'Другой банк', country: '', swift: '' }
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
      toast.error(t("fillAllFields") || "Please fill all required fields")
      return
    }

    if (!validateSwiftCode(swiftCode)) {
      toast.error(t("invalidSwiftCode") || "Invalid SWIFT/BIC code format")
      return
    }

    if (!validateAccountNumber(accountNumber)) {
      toast.error(t("invalidAccountNumber") || "Invalid account number format")
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

        {/* Transfer Summary Section */}
        <div style={{
          padding: '1rem',
          margin: '0 1rem 1rem',
          background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderRadius: '12px'
        }}>
          {/* Amount Summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                {t("yousend") || "Siz yuborasiz"}
              </p>
              <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {sendAmount} {fromCurrency}
              </h3>
            </div>
            <ArrowRight size={20} style={{ opacity: 0.5 }} />
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                {t("willtake") || "Qabul qiladi"}
              </p>
              <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {receiveAmount} {toCurrency}
              </h3>
            </div>
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("exchangeRate") || "Ayirboshlash kursi"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                1 {fromCurrency} = {typeof exchangeRate === 'object' ? exchangeRate.rate?.toLocaleString('en-US', { maximumFractionDigits: 4 }) : exchangeRate?.toLocaleString('en-US', { maximumFractionDigits: 4 })} {toCurrency}
              </span>
            </div>
          )}

          {/* Fees */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              {t("fee") || "Komissiya"}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {feeCalculation ? `${feeCalculation.transferFeePercentage}%` : `${transferFeePercentage}%`}
            </span>
          </div>

          {feeCalculation && feeCalculation.transferFeeAmount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("feeCount") || "Komissiya miqdori"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {feeCalculation.transferFeeAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {fromCurrency}
              </span>
            </div>
          )}

          {feeCalculation && feeCalculation.exchangeRateFeePercentage > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("exchangeRateFee") || "Ayirboshlash kursi komissiyasi"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {feeCalculation.exchangeRateFeePercentage}%
              </span>
            </div>
          )}
        </div>

        <p style={{
          padding: '0 1rem',
          fontSize: '0.9rem',
          opacity: 0.7,
          marginBottom: '1rem'
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
            <div className="date-input-container" style={{ padding: 0, flexDirection: 'column', alignItems: 'stretch' }}>
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
                <div className="country-dropdown-menu" style={{ position: 'relative', marginTop: '0', maxHeight: '250px', overflowY: 'auto', width: '100%' }}>
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
              id="bankTerms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="terms-checkbox"
            />
            <label htmlFor="bankTerms" className="terms-label">
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
