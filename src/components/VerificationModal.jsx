import { useGlobalContext } from '../Context'
import './modals.css'

const VerificationModal = ({ isOpen, onClose, onConfirm, isLoggedIn = true }) => {
    const { t, theme } = useGlobalContext()

    if (!isOpen) return null

    // Different text for logged in vs not logged in users
    const title = isLoggedIn
        ? (t('verification.title') || 'Пройдите верификацию личности за пять минут')
        : (t('verification.registerTitle') || 'Пройдите верификацию личности за пять минут')

    const description = isLoggedIn
        ? (t('verification.description') || 'Перед тем как начать переводить средства, нам нужно убедится что вы реальный человек')
        : (t('verification.registerDescription') || 'Перед тем как начать переводить средства, нам нужно убедится что вы реальный человек')

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-container verification-modal`} onClick={(e) => e.stopPropagation()}>
                {/* Header - Icon and Title in row */}
                <div className="verification-header">
                    <div className="verification-icon">
                        <img src={`/images/verified${theme}.png`} alt="" />
                    </div>
                    <h2 className="verification-title">
                        {title}
                    </h2>
                </div>

                {/* Description */}
                <p className="verification-description">
                    {description}
                </p>

                {/* Buttons */}
                <div className="modal-buttons">
                    <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                        {t('cancel') || 'Отмена'}
                    </button>
                    <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                        {t('verification.proceed') || 'Перейти'}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerificationModal
