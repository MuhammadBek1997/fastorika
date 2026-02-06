import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { XCircle } from 'lucide-react'
import '../styles/paymentresult.css'

const PaymentFail = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <div className="payment-result-icon fail">
          <XCircle size={64} />
        </div>
        <h1 className="payment-result-title">
          {t('paymentFailed') || 'To\'lov amalga oshmadi'}
        </h1>
        <p className="payment-result-text">
          {t('paymentFailedDesc') || 'To\'lov jarayonida xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'}
        </p>
        <div className="payment-result-actions">
          <button
            className="payment-result-btn"
            onClick={() => navigate('/transactions')}
          >
            {t('goToTransactions') || 'Tranzaksiyalarga o\'tish'}
          </button>
          <button
            className="payment-result-btn-outline"
            onClick={() => navigate('/currency')}
          >
            {t('tryAgain') || 'Qaytadan urinish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentFail
