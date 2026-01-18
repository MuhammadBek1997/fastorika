import { useGlobalContext } from '../Context'
import './modals.css'

const CancelTransactionModal = ({ isOpen, onClose, onConfirm }) => {
    const { t, theme } = useGlobalContext()

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-container cancel-modal`} onClick={(e) => e.stopPropagation()}>
                {/* Title */}
                <h2 className="modal-title">
                    {t('cancelTransaction.title') || 'Отменить перевод?'}
                </h2>

                {/* Subtitle */}
                <p className="modal-subtitle">
                    {t('cancelTransaction.subtitle') || 'Вы уверены, что хотите отменить перевод?'}
                </p>
                <hr />
                {/* Description */}
                <p className="modal-description">
                    {t('cancelTransaction.description') || 'Если у вас возникли вопросы или вы столкнулись с проблемой, пожалуйста, свяжитесь с нашей службой поддержки — мы вам поможем'}
                </p>

                {/* Buttons */}
                <div className="modal-buttons">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                        {t('cancel') || 'Отмена'}
                    </button>
                    <button className="modal-btn modal-btn-confirm modal-btn-danger" onClick={onConfirm}>
                        {t('confirm') || 'Подтвердить'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CancelTransactionModal
