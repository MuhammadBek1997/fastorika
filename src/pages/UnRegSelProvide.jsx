

import { useGlobalContext } from "../Context"
import { useNavigate } from "react-router-dom"
import "../styles/unregselprovide.css"

const UnRegSelProvide = () => {
  const { t } = useGlobalContext()
  const navigate = useNavigate()

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1>{t('paymentSystem')}</h1>
          <p>{t('selectPaymentSystem')}</p>
        </div>

        {/* Transfer via Fastorika */}
        <div className="payment-method">
          <div className="payment-method-header">
            <div className="payment-method-info">
              <img src="/images/fastorika-icon.png" alt="Fastorika" className="payment-method-icon" />
              <div className="payment-method-details">
                <h3>Transfer via Fastorika</h3>
                <p>{t('commission')} 0%</p>
              </div>
            </div>
            <div className="radio-button active"></div>
          </div>
          <button 
            onClick={() => navigate('/continue-transfer')}
            className="continue-button primary"
          >
            {t('continue')}
          </button>
        </div>

        {/* Provider Name */}
        <div className="payment-method">
          <div className="payment-method-header">
            <div className="payment-method-info">
              <div className="payment-method-icon" style={{ background: 'var(--border-light)' }}></div>
              <div className="payment-method-details">
                <h3>{t('providerName')}</h3>
                <p>{t('commission')} 3.5% + 1.7 EUR</p>
              </div>
            </div>
            <div className="radio-button"></div>
          </div>
          <button 
            className="continue-button secondary"
          >
            {t('continue')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnRegSelProvide