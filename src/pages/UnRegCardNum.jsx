import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft } from "lucide-react"

const UnRegCardNum = () => {
    let { t, theme } = useGlobalContext()
    const navigate = useNavigate()

    const [cardNumber, setCardNumber] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

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

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '')
        if (value.length <= 12) {
            setPhoneNumber(value)
        }
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
                    <h2 style={{ margin: 0 }}>
                        {t("recipientDetails")}
                    </h2>
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
                                placeholder="0000 0000 0000 0000"
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
                                placeholder="+998"
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

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>
                                {t("firstName")}
                            </label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
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
                        <div style={{ flex: 1 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>
                                {t("lastName")}
                            </label>
                            <div className="date-input-container">
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
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
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '1rem',
                        marginBottom: '1rem',
                        backgroundColor: theme === 'dark' ? 'var(--bg-body-dark)' : 'var(--bg-body-light)'
                    }}>
                        <input
                            type="checkbox"
                            id="nameWarning"
                            style={{ width: '1.2rem', height: '1.2rem' }}
                        />
                        <label htmlFor="nameWarning" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                            {t("nameWarning")}
                        </label>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            <p>{t("termsAccept")}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input type="checkbox" id="terms" style={{ width: '1.2rem', height: '1.2rem' }} />
                            <label htmlFor="terms" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                                {t("confirmTerms")} <span style={{ color: '#00D796', cursor: 'pointer' }}>{t("terms")}</span> {t("and")} <span style={{ color: '#00D796', cursor: 'pointer' }}>{t("policy")}</span>
                            </label>
                        </div>
                    </div>

                    <button
                        className="currency-continueBtn"
                        onClick={() => {
                            // Navigate to next step
                            console.log('Continue with card payment')
                        }}
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UnRegCardNum