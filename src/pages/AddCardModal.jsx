import { useEffect, useState } from "react"
import { useGlobalContext } from "../Context"
import { apiFetch, addCard } from "../api"
import { toast } from 'react-toastify'
import './addcardmodal.css'


const AddCardModal = () => {
    const { t, theme, setAddCardModal, user, refreshCards } = useGlobalContext()

    const [countryOpen, setCountryOpen] = useState(false)
    const [countriesList, setCountriesList] = useState([])
    const [country, setCountry] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Common fields
    const [cardHolderName, setCardHolderName] = useState("")

    // Uzbekistan (UZ) fields
    const [cardNumber, setCardNumber] = useState("")
    const [expirationMonth, setExpirationMonth] = useState("")
    const [expirationYear, setExpirationYear] = useState("")

    // India (IN) fields
    const [upiId, setUpiId] = useState("")
    const [ifscCode, setIfscCode] = useState("")
    const [accountNumber, setAccountNumber] = useState("")

    // China (CN) fields
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("+86")
    const [postalCode, setPostalCode] = useState("")
    const [bankName, setBankName] = useState("")
    const [cnAccountNumber, setCnAccountNumber] = useState("")

    // EU/CIS/Other fields
    const [euCardNumber, setEuCardNumber] = useState("")
    const [expirationDate, setExpirationDate] = useState("")
    const [iban, setIban] = useState("")

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\s/g, '')
        const formatted = numbers.match(/.{1,4}/g)
        return formatted ? formatted.join(' ') : numbers
    }

    const handleCardNumberChange = (value, setter) => {
        const numbers = value.replace(/\s/g, '')
        if (numbers.length <= 16 && /^\d*$/.test(numbers)) {
            setter(formatCardNumber(numbers))
        }
    }

    const handleExpirationDateChange = (value) => {
        let cleaned = value.replace(/[^\d]/g, '')
        if (cleaned.length > 4) cleaned = cleaned.slice(0, 4)
        if (cleaned.length >= 3) {
            cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
        }
        setExpirationDate(cleaned)
    }

    // Load countries from backend
    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch('countries', { method: 'GET' })
                const response = await res.json()
                if (!res.ok) throw new Error(response?.message || 'Failed to load countries')

                // Backend returns: { success: true, data: [...] }
                const data = response?.data || response

                // Expect array of { id/countryId, code, name }
                const normalized = Array.isArray(data) ? data.map(c => ({
                    countryId: c.countryId ?? c.id ?? null,
                    code: c.code ?? c.isoCode ?? '',
                    name: c.name ?? ''
                })).filter(c => c.name) : []
                setCountriesList(normalized)
                if (normalized.length && !country) setCountry(normalized[0])
            } catch (err) {
                console.warn('Countries load error:', err?.message || err)
                setCountriesList([])
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getCountryType = () => {
        if (!country?.code) return 'other'
        const code = country.code.toUpperCase()
        if (code === 'UZ') return 'uzbekistan'
        if (code === 'IN') return 'india'
        if (code === 'CN') return 'china'
        return 'other'
    }

    const buildPayload = () => {
        const countryType = getCountryType()

        switch (countryType) {
            case 'uzbekistan':
                return {
                    countryId: country.countryId,
                    cardNetwork: "VISA", // Default, can be detected from card number
                    countryCode: country.code,
                    cardData: {
                        cardNumber: cardNumber.replace(/\s/g, ''),
                        expirationMonth: String(expirationMonth).padStart(2, '0'),
                        expirationYear: String(expirationYear),
                        cardHolderName: cardHolderName.trim(),
                        bankName: bankName.trim()
                    }
                }

            case 'india':
                return {
                    countryId: country.countryId,
                    cardNetwork: "UPI",
                    countryCode: country.code,
                    cardData: {
                        upiId: upiId.trim(),
                        ifscCode: ifscCode.trim(),
                        accountNumber: accountNumber.trim(),
                        name: cardHolderName.trim()
                    }
                }

            case 'china':
                return {
                    countryId: country.countryId,
                    cardNetwork: "UnionPay",
                    countryCode: country.code,
                    cardData: {
                        fullName: fullName.trim(),
                        phoneNumber: phoneNumber.trim(),
                        postalCode: postalCode.trim(),
                        bankName: bankName.trim(),
                        accountNumber: cnAccountNumber.trim()
                    }
                }

            default: // EU/CIS/Other
                return {
                    countryId: country.countryId,
                    cardNetwork: "VISA", // Default
                    countryCode: country.code,
                    cardData: {
                        cardNumber: euCardNumber.replace(/\s/g, ''),
                        expirationDate: expirationDate,
                        cardHolderName: cardHolderName.trim(),
                        ...(iban ? { iban: iban.trim() } : {})
                    }
                }
        }
    }

    const validateForm = () => {
        const countryType = getCountryType()

        switch (countryType) {
            case 'uzbekistan':
                if (!cardNumber || !expirationMonth || !expirationYear || !cardHolderName || !bankName) {
                    toast.error(t('addCardModal.errors.fillRequired') || 'Please fill all required fields')
                    return false
                }
                if (cardNumber.replace(/\s/g, '').length !== 16) {
                    toast.error(t('addCardModal.errors.invalidCard') || 'Invalid card number')
                    return false
                }
                const monthNum = parseInt(expirationMonth, 10)
                if (monthNum < 1 || monthNum > 12) {
                    toast.error(t('addCardModal.errors.invalidMonth') || 'Invalid month (1-12)')
                    return false
                }
                const yearNum = parseInt(expirationYear, 10)
                const currentYear = new Date().getFullYear()
                if (yearNum < currentYear || yearNum > currentYear + 20) {
                    toast.error(t('addCardModal.errors.invalidYear') || 'Invalid year')
                    return false
                }
                break

            case 'india':
                if (!upiId || !ifscCode || !accountNumber || !cardHolderName) {
                    toast.error(t('addCardModal.errors.fillRequired') || 'Please fill all required fields')
                    return false
                }
                break

            case 'china':
                if (!fullName || !phoneNumber || !postalCode || !bankName || !cnAccountNumber) {
                    toast.error(t('addCardModal.errors.fillRequired') || 'Please fill all required fields')
                    return false
                }
                break

            default: // EU/CIS/Other
                if (!euCardNumber || !expirationDate || !cardHolderName) {
                    toast.error(t('addCardModal.errors.fillRequired') || 'Please fill all required fields')
                    return false
                }
                if (euCardNumber.replace(/\s/g, '').length !== 16) {
                    toast.error(t('addCardModal.errors.invalidCard') || 'Invalid card number')
                    return false
                }
                break
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!country) {
            toast.error(t('addCardModal.errors.selectCountry') || 'Please select a country')
            return
        }

        if (!validateForm()) return

        const payload = buildPayload()
        console.log('Add card payload:', payload)

        try {
            setSubmitting(true)
            await addCard(payload)
            toast.success(t('myCards.cardAdded') || 'Card added successfully')
            setAddCardModal(false)
            refreshCards()
        } catch (err) {
            console.warn('Add card error:', err?.message || err)
            toast.error(err?.message || t('toast.networkError'))
        } finally {
            setSubmitting(false)
        }
    }

    const renderFormFields = () => {
        const countryType = getCountryType()

        switch (countryType) {
            case 'uzbekistan':
                return (
                    <>
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="cardNumber">{t('addCardModal.cardNumber') || 'Card Number'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="cardNumber"
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => handleCardNumberChange(e.target.value, setCardNumber)}
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div className="addCardModal-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label htmlFor="uzExpirationMonth">{t('addCardModal.expirationMonth') || 'Month (MM)'} *</label>
                                <div className="date-input-container">
                                    <input
                                        id="uzExpirationMonth"
                                        type="text"
                                        value={expirationMonth || ''}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/[^\d]/g, '')
                                            if (value.length > 2) {
                                                value = value.slice(0, 2)
                                            }
                                            // Validate month (01-12)
                                            if (value.length === 2) {
                                                const monthNum = parseInt(value, 10)
                                                if (monthNum < 1 || monthNum > 12) {
                                                    return
                                                }
                                            }
                                            setExpirationMonth(value)
                                        }}
                                        placeholder="11"
                                        maxLength="2"
                                    />
                                </div>
                            </div>

                            <div className="addCardModal-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label htmlFor="uzExpirationYear">{t('addCardModal.expirationYear') || 'Year (YYYY)'} *</label>
                                <div className="date-input-container">
                                    <input
                                        id="uzExpirationYear"
                                        type="text"
                                        value={expirationYear || ''}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/[^\d]/g, '')
                                            if (value.length > 4) {
                                                value = value.slice(0, 4)
                                            }
                                            setExpirationYear(value)
                                        }}
                                        placeholder="2027"
                                        maxLength="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="cardHolderName">{t('addCardModal.cardHolderName') || 'Cardholder Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="cardHolderName"
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(e) => setCardHolderName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="uzBankName">{t('addCardModal.bankName') || 'Bank Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="uzBankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="National Bank"
                                />
                            </div>
                        </div>
                    </>
                )

            case 'india':
                return (
                    <>
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="upiId">{t('addCardModal.upiId') || 'UPI ID'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="upiId"
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="user@upi"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="ifscCode">{t('addCardModal.ifscCode') || 'IFSC Code'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="ifscCode"
                                    type="text"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value)}
                                    placeholder="IFSC001"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="accountNumber">{t('addCardModal.accountNumber') || 'Account Number'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="accountNumber"
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="cardHolderName">{t('addCardModal.cardHolderName') || 'Account Holder Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="cardHolderName"
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(e) => setCardHolderName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    </>
                )

            case 'china':
                return (
                    <>
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="fullName">{t('addCardModal.fullName') || 'Full Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="phoneNumber">{t('addCardModal.phoneNumber') || 'Phone Number'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+861234567890"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="postalCode">{t('addCardModal.postalCode') || 'Postal Code'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="postalCode"
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="100000"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="bankName">{t('addCardModal.bankName') || 'Bank Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="bankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="Bank of China"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="cnAccountNumber">{t('addCardModal.accountNumber') || 'Account Number'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="cnAccountNumber"
                                    type="text"
                                    value={cnAccountNumber}
                                    onChange={(e) => setCnAccountNumber(e.target.value)}
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                    </>
                )

            default: // EU/CIS/Other
                return (
                    <>
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="euCardNumber">{t('addCardModal.cardNumber') || 'Card Number'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="euCardNumber"
                                    type="text"
                                    value={euCardNumber}
                                    onChange={(e) => handleCardNumberChange(e.target.value, setEuCardNumber)}
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="expirationDate">{t('addCardModal.expirationDate') || 'Expiration Date (MM/YY)'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="expirationDate"
                                    type="text"
                                    value={expirationDate}
                                    onChange={(e) => handleExpirationDateChange(e.target.value)}
                                    placeholder="12/25"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="cardHolderName">{t('addCardModal.cardHolderName') || 'Cardholder Name'} *</label>
                            <div className="date-input-container">
                                <input
                                    id="cardHolderName"
                                    type="text"
                                    value={cardHolderName}
                                    onChange={(e) => setCardHolderName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="iban">{t('addCardModal.iban') || 'IBAN (Optional)'}</label>
                            <div className="date-input-container">
                                <input
                                    id="iban"
                                    type="text"
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value)}
                                    placeholder="GB82WEST12345698765432"
                                />
                            </div>
                        </div>
                    </>
                )
        }
    }

    return (
        <div className="addCardModal" data-theme={theme}>
            <div className="addCardModal-cont">
                <div className="addCardModal-navbar">
                    <h2 className='addCardModal-head'>
                        {t('addCardModal.title') || 'Add Card'}
                    </h2>
                    <button className='addCardModalBtn' aria-label={t('addCardModal.closeButton')} onClick={() => setAddCardModal(false)}>
                        <img src={`/images/back${theme}.png`} alt="close" style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>

                <div className="addCardModal-body">
                    <form className="addCardModal-form" onSubmit={handleSubmit}>
                        {/* Country */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label>
                                {t('addCardModal.country') || 'Country'} *
                            </label>
                            <div className="currDropdown">
                                <button
                                    type="button"
                                    onClick={() => setCountryOpen(!countryOpen)}
                                    className="currToggle"
                                >
                                    <span style={{ fontWeight: 500 }}>{country?.name || t('addCardModal.country')}</span>
                                    <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                {countryOpen && (
                                    <div className="currDropdownMenu">
                                        {countriesList.map((c) => (
                                            <button
                                                key={c.countryId ?? c.name}
                                                type="button"
                                                onClick={() => { setCountry(c); setCountryOpen(false) }}
                                                className={`currOption ${country?.countryId === c.countryId ? 'active' : ''}`}
                                            >
                                                <span>{c.name} ({c.code})</span>
                                                {country?.countryId === c.countryId && (
                                                    <img src={`/images/ruleDone${theme}.png`} alt="Selected" style={{ width: 18, height: 18 }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic form fields based on country */}
                        {renderFormFields()}

                        {/* Actions */}
                        <div className='actionsRow'>
                            <button type="button" onClick={() => setAddCardModal(false)} className='btnCancel'>
                                {t('addCardModal.cancel') || 'Cancel'}
                            </button>

                            <button type="submit" disabled={submitting} className='btnSubmit'>
                                {submitting ? (t('addCardModal.adding') || 'Adding...') : (t('addCardModal.addCard') || 'Add Card')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddCardModal
