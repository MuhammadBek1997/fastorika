import { useState } from "react"
import { useGlobalContext } from "../Context"


const AddCardModal = () => {
    const { t, theme, setAddCardModal } = useGlobalContext()

    const [countryOpen, setCountryOpen] = useState(false)
    const countries = [
        { key: 'uzbekistan', label: t('profilePage.countries.uzbekistan') },
        { key: 'russia', label: t('profilePage.countries.russia') }
    ]
    const [country, setCountry] = useState(countries[0])

    const [cardNumber, setCardNumber] = useState("")
    const [expire, setExpire] = useState("")
    const [bankName, setBankName] = useState("")
    const [phone, setPhone] = useState("+998")

    const formatCardNumber = (value) => {
        const numbers = value.replace(/\s/g, '')
        const formatted = numbers.match(/.{1,4}/g)
        return formatted ? formatted.join(' ') : numbers
    }

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\s/g, '')
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setCardNumber(formatCardNumber(value))
        }
    }

    const handleExpireChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, '')
        if (value.length > 4) value = value.slice(0, 4)
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2)
        }
        setExpire(value)
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^\d+]/g, '')
        if (!value.startsWith('+')) value = '+' + value
        setPhone(value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: integrate with API when backend is ready
        console.log('Add card:', { country: country.key, cardNumber, expire, bankName, phone })
        setAddCardModal(false)
    }

    return (
        <div className="addCardModal" data-theme={theme}>
            <div className="addCardModal-cont">
                <div className="addCardModal-navbar" style={{ padding: 0 }}>
                    <h2 className='addCardModal-head'>
                        {t('addCardModal.title')}
                    </h2>
                    <button className='addCardModalBtn' aria-label={t('addCardModal.closeButton')} onClick={() => setAddCardModal(false)}>
                        <img src={`/images/back${theme}.png`} alt="close" style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>

                <div className="addCardModal-body" style={{ marginTop: '0.5rem' }}>
                    <form className="addCardModal-form" onSubmit={handleSubmit}>
                        {/* Country */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                                {t('addCardModal.country')}
                            </label>
                            <div className="currDropdown">
                                <button
                                    type="button"
                                    onClick={() => setCountryOpen(!countryOpen)}
                                    className="currToggle"
                                    style={{ width: '100%', justifyContent: 'space-between' }}
                                >
                                    <span style={{ fontWeight: 500 }}>{country.label}</span>
                                    <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                {countryOpen && (
                                    <div className="currDropdownMenu" style={{ width: '100%' }}>
                                        {countries.map((c, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => { setCountry(c); setCountryOpen(false) }}
                                                className={`currOption ${country.key === c.key ? 'active' : ''}`}
                                                style={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>{c.label}</span>
                                                {country.key === c.key && (
                                                    <img src={`/images/ruleDone${theme}.png`} alt="Selected" style={{ width: 18, height: 18 }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card number */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="cardNumber" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('addCardModal.cardNumber')}</label>
                            <div className="date-input-container">
                                <input
                                    id="cardNumber"
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder={t('addCardModal.placeholders.cardNumber')}
                                    style={{ width: '100%', border: 'none', outline: 'none', background: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Expire */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="expireDate" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('addCardModal.expireDate')}</label>
                            <div className="date-input-container">
                                <input
                                    id="expireDate"
                                    type="text"
                                    value={expire}
                                    onChange={handleExpireChange}
                                    placeholder={t('addCardModal.placeholders.expire')}
                                    style={{ width: '100%', border: 'none', outline: 'none', background: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Bank name */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="bankName" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('addCardModal.bankName')}</label>
                            <div className="date-input-container">
                                <input
                                    id="bankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder={t('addCardModal.placeholders.bankName')}
                                    style={{ width: '100%', border: 'none', outline: 'none', background: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('addCardModal.phoneNumber')}</label>
                            <div className="date-input-container">
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder={t('addCardModal.placeholders.phoneNumber')}
                                    style={{ width: '100%', border: 'none', outline: 'none', background: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                            <button type="button" onClick={() => setAddCardModal(false)}
                                style={{
                                    padding: '0.9rem 1.2rem',
                                    borderRadius: '1rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    backgroundColor: theme === 'dark' ? 'var(--bg-body-dark)' : 'var(--bg-body-light)'
                                }}
                            >{t('addCardModal.cancel')}</button>

                            <button type="submit"
                                style={{
                                    backgroundColor: '#00D796',
                                    padding: '0.9rem 1.2rem',
                                    borderRadius: '1rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    color: '#fff'
                                }}
                            >{t('addCardModal.addCard')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddCardModal