import { useEffect, useState } from "react"
import { useGlobalContext } from "../Context"
import { apiFetch } from "../api"
import { toast } from 'react-toastify'
import './addcardmodal.css'


const AddCardModal = () => {
    const { t, theme, setAddCardModal, user, refreshCards } = useGlobalContext()

    const [countryOpen, setCountryOpen] = useState(false)
    const [countriesList, setCountriesList] = useState([])
    const [country, setCountry] = useState(null)

    const [cardNumber, setCardNumber] = useState("")
    const [expire, setExpire] = useState("")
    const [bankName, setBankName] = useState("")
    const [phone, setPhone] = useState("+998")
    const [submitting, setSubmitting] = useState(false)

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

    // Load countries from backend
    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch('country/all', { method: 'GET' })
                const data = await res.json()
                if (!res.ok) throw new Error(data?.message || 'Failed to load countries')
                // Expect array of { countryId, code, name }
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!country) {
            toast.error(t('toast.networkError'))
            return
        }
        if (!user?.userId) {
            toast.error(t('toast.networkError'))
            return
        }
        // Derive expiryMonth and expiryYear from `expire` input (MM/YY or MMYY)
        const cleanExpire = String(expire || '').replace(/[^0-9]/g, '')
        const mm = cleanExpire.length >= 2 ? cleanExpire.slice(0, 2) : ''
        const yy = cleanExpire.length >= 4 ? cleanExpire.slice(2, 4) : (cleanExpire.length >= 3 ? cleanExpire.slice(2) : '')
        const expiryMonth = mm ? Number(mm) : null
        const expiryYear = yy ? Number(yy) : null
        const payload = {
            country: {
                countryId: country.countryId,
                code: country.code,
                name: country.name
            },
            bankName: bankName.trim(),
            cardNumber: cardNumber.replace(/\s/g, ''), // cardNumber sifatida jo'natiladi
            expiryMonth,
            expiryYear,
            name: (user?.name || '').trim(),
            phone: phone.trim()
        }
        console.log('Add card payload:', payload)
        try {
            setSubmitting(true)
            const res = await apiFetch(`cards/user/${user.userId}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'Add card error')
            toast.success('Card added')
            setAddCardModal(false)
            // Signal cards list to refresh
            refreshCards()
        } catch (err) {
            console.warn('Add card error:', err?.message || err)
            toast.error(err?.message || t('toast.networkError'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="addCardModal" data-theme={theme}>
            <div className="addCardModal-cont">
                <div className="addCardModal-navbar">
                    <h2 className='addCardModal-head'>
                        {t('addCardModal.title')}
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
                                {t('addCardModal.country')}
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
                                                <span>{c.name}</span>
                                                {country?.countryId === c.countryId && (
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
                            <label htmlFor="cardNumber">{t('addCardModal.cardNumber')}</label>
                            <div className="date-input-container">
                                <input
                                    id="cardNumber"
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder={t('addCardModal.placeholders.cardNumber')}
                                />
                            </div>
                        </div>

                        {/* Expire */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="expireDate">{t('addCardModal.expireDate')}</label>
                            <div className="date-input-container">
                                <input
                                    id="expireDate"
                                    type="text"
                                    value={expire}
                                    onChange={handleExpireChange}
                                    placeholder={t('addCardModal.placeholders.expire')}
                                />
                            </div>
                        </div>

                        {/* Bank name */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '0.75rem' }}>
                            <label htmlFor="bankName">{t('addCardModal.bankName')}</label>
                            <div className="date-input-container">
                                <input
                                    id="bankName"
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder={t('addCardModal.placeholders.bankName')}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="addCardModal-form-group" style={{ marginBottom: '1rem' }}>
                            <label htmlFor="phoneNumber">{t('addCardModal.phoneNumber')}</label>
                            <div className="date-input-container">
                                <input
                                    id="phoneNumber"
                                    type="text"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder={t('addCardModal.placeholders.phoneNumber')}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='actionsRow'>
                            <button type="button" onClick={() => setAddCardModal(false)} className='btnCancel'>
                                {t('addCardModal.cancel')}
                            </button>

                            <button type="submit" disabled={submitting} className='btnSubmit'>
                                {t('addCardModal.addCard')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddCardModal