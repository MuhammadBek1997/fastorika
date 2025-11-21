

import { useGlobalContext } from "../Context"
import { useLocation, useNavigate } from "react-router-dom"
import { useMemo, useState } from "react"
import "../styles/unregselprovide.css"
import { ArrowLeft } from "lucide-react"

const UnRegSelProvide = () => {
  const { t } = useGlobalContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Default providers (fallback if none are passed from previous step)
  const defaultProviders = useMemo(() => ([
    {
      id: 'Provider-1',
      name: t('providerName'),
      commission: '0%',
      icon: null
    },
    {
      id: 'provider-2',
      name: t('providerName'),
      commission: '0%',
      icon: null
    },
    {
      id: 'provider-3',
      name: t('providerName'),
      commission: '3.5% + 1.7 EUR',
      icon: null
    }
  ]), [t])

  // Prefer providers passed via route state; otherwise use defaults
  const providers = (location.state?.providers && Array.isArray(location.state.providers) && location.state.providers.length > 0)
    ? location.state.providers
    : defaultProviders

  const [selectedId, setSelectedId] = useState(providers[0]?.id)

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleContinue = (provider) => {
    if (!provider) return
    navigate('/continue-transfer', { state: { provider } })
  }

  return (
    <div className="payment-container">
      <div className="currency-head-back">
                <button
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                    <ArrowLeft size={24} />
                    {t("back")}
                </button>

            </div>
      <div className="payment-card">
        <div className="payment-header">
          <h1>{t('paymentSystem')}</h1>
          <p>{t('selectPaymentSystem')}</p>
        </div>

        <div className="payment-list">
        {providers.map((p) => {
          const isActive = selectedId === p.id
          return (
            <div key={p.id} className="payment-method" onClick={() => handleSelect(p.id)}>
              <div className="payment-method-header">
                <div className="payment-method-info">
                  {p.icon
                    ? <img src={p.icon} alt={p.name} className="payment-method-icon" />
                    : <div className="payment-method-icon" style={{ background: 'var(--border-light)' }} />}
                  <div className="payment-method-details">
                    <h3>{p.name}</h3>
                    <p>{t('commission')} {p.commission}</p>
                  </div>
                </div>
                <div className={`radio-button ${isActive ? 'active' : ''}`}></div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleContinue(p) }}
                className={`continue-button ${isActive ? 'primary' : 'secondary'}`}
                disabled={!isActive}
              >
                {t('continue')}
              </button>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default UnRegSelProvide