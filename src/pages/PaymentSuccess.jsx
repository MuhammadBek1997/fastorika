import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { CheckCircle } from 'lucide-react'
import '../styles/paymentresult.css'

const PaymentSuccess = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('pending')
  }, [])

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <div className="payment-result-icon success">
          <CheckCircle size={64} />
        </div>
        <h1 className="payment-result-title">
          {t('paymentSuccess') || 'To\'lov muvaffaqiyatli!'}
        </h1>
        <p className="payment-result-text">
          {t('paymentSuccessDesc') || 'Sizning to\'lovingiz qabul qilindi. Tranzaksiya tez orada qayta ishlanadi.'}
        </p>
        <button
          className="payment-result-btn"
          onClick={() => navigate('/transactions')}
        >
          {t('goToTransactions') || 'Tranzaksiyalarga o\'tish'}
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
