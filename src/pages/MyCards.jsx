import { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context'
import AddCardModal from './AddCardModal'
import { deleteCard } from '../api'
import { toast } from 'react-toastify'
import './mycards.css'

const MyCards = () => {
  let { t, theme, addCardModal, setAddCardModal, user, cardsRefreshKey, cards, cardsLoading, loadUserCards, refreshCards } = useGlobalContext()
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [cardToDelete, setCardToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadUserCards()
  }, [user?.userId, cardsRefreshKey])

  const handleDeleteClick = (card) => {
    setCardToDelete(card)
    setDeleteConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return
    try {
      setDeleting(true)
      await deleteCard(cardToDelete.id || cardToDelete.cardId)
      toast.success(t('myCards.cardDeleted') || 'Card deleted successfully')
      setDeleteConfirmModal(false)
      setCardToDelete(null)
      refreshCards()
    } catch (err) {
      console.error('Delete card error:', err)
      toast.error(err?.message || t('toast.networkError'))
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmModal(false)
    setCardToDelete(null)
  }

  return (
    <div className='myCards' id='webSection'>
      <div className="myCards-navbar">
        <h2 className='myCards-head'>
          {t('myCards.title')}
        </h2>
        <button className='myCardsBtn' onClick={()=>setAddCardModal(true)}>
          {t('myCards.addButton')}
        </button>
      </div>
      <div className="myCards-body">
        {cardsLoading && (
          <p style={{ opacity: 0.8 }}>{t('loading') || 'Loading...'}</p>
        )}
        {!cardsLoading && cards.length === 0 && (
          <p style={{ opacity: 0.8 }}>{t('noData') || 'No cards found'}</p>
        )}
        {!cardsLoading && cards.length > 0 && (
          <div className='cardsGrid'>
            {cards.map((c, idx) => {
              const rawNum = typeof c.cardNumber === 'string' ? c.cardNumber : c.accountNumber
              const digits = typeof rawNum === 'string' ? rawNum.replace(/\s/g, '') : ''
              const last4 = digits ? digits.slice(-4) : ''
              const masked = last4 ? `** ${last4}` : '**** **** **** ****'

              // Check if country is Uzbekistan
              const countryName = c.country?.name || c.countryName || ''
              const isUzbekistan = countryName.toLowerCase().includes('uzbek')

              // Format expiry date
              const mm = c?.expiryMonth
              const yy = c?.expiryYear
              let expiry = ''

              if (mm != null && yy != null) {
                  // Standard MM/YY format for all based on design
                  expiry = `${String(mm).padStart(2, '0')}/${String(String(yy).slice(-2)).padStart(2, '0')}`
              } else {
                expiry = c.expire || c.expiry || c.expireDate || '11/25'
              }

              const brand = (c.brand || 'VISA').toUpperCase()
              return (
                <div key={c.id ?? c.cardId ?? idx} className='cardTile'>
                  <div className='cardHeader'>
                    <div className='cardHeader-left'>
                      <div className='cardInfoIcon'>
                        <img src={`/images/cardIcon${theme}.png`} alt='Card Icon' />
                      </div>
                      <h3 className='cardBankName'>{c.bankName || t('myCards.unknownBank') || '—'}</h3>
                    </div>
                    <button
                      type='button'
                      aria-label='Delete card'
                      className='cardMenuBtn'
                      onClick={() => handleDeleteClick(c)}
                      title={t('myCards.deleteCard') || 'Delete card'}
                    >
                      •••
                    </button>
                  </div>

                  <div className='cardNumber'>
                    <p className='cardNumberText'>{masked}</p>
                  </div>

                  <div className='cardFooter'>
                      <span className='cardExpiry'>{expiry}</span>
                      {brand.includes('VISA') ? (
                        <span className='cardBrandVisa'>VISA</span>
                      ) : (
                        <div className='cardBrandMastercard' title={brand}>
                           <span className='mc-circle mc-red'></span>
                           <span className='mc-circle mc-orange'></span>
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {addCardModal && <AddCardModal />}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className='modal-overlay' onClick={cancelDelete}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <h3>{t('myCards.deleteConfirmTitle') || 'Delete Card'}</h3>
            <p>
              {t('myCards.deleteConfirmMessage') || 'Are you sure you want to delete this card?'}
            </p>
            {cardToDelete && (
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                <strong>{cardToDelete.bankName}</strong>
                <br />
                {typeof cardToDelete.cardNumber === 'string'
                  ? `•••• ${cardToDelete.cardNumber.slice(-4)}`
                  : '••••'}
              </div>
            )}
            <div className='modal-actions'>
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className='btn-secondary'
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className='btn-danger'
              >
                {deleting ? (t('deleting') || 'Deleting...') : (t('delete') || 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCards