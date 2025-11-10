
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import '../styles/unreginstruction.css'

const UnRegInstruction = () => {
  const { t } = useGlobalContext()
  const navigate = useNavigate()
  const [isChecked, setIsChecked] = useState(false)

  const steps = [
    t('step1Instructions'),
    t('step2Instructions'),
    t('step3Instructions'),
    t('step4Instructions'),
    t('step5Instructions')
  ]

  return (
    <div className="instruction-container">
      <div className="instruction-card">
        <div className="instruction-header">
          <button 
            className="instruction-back"
            onClick={() => navigate(-1)}
          >
            ← {t('back')}
          </button>
          <h1 className="instruction-title">{t('howToPay')}</h1>
          <p className="instruction-subtitle">{t('followSteps')}</p>
        </div>

        <div className="instruction-steps">
          {steps.map((step, index) => (
            <div key={index} className="instruction-step">
              <span className="step-number">{index + 1}</span>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>

        <label className="instruction-checkbox">
          <input 
            type="checkbox"
            className="checkbox-input"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="checkbox-label">
            {t('agreeWithInstructions')}
          </span>
        </label>

        <button 
          className="continue-button"
          disabled={!isChecked}
          onClick={() => navigate('/payment')}
        >
          {t('continue')}
        </button>
      </div>
    </div>
  )
}

export default UnRegInstruction