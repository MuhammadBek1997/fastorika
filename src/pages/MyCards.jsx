import { useEffect, useState } from 'react'
import { useGlobalContext } from '../Context'
import AddCardModal from './AddCardModal'
import { deleteCard } from '../api'
import { toast } from 'react-toastify'
import './mycards.css'

const MyCards = () => {
  let { t, theme, addCardModal, setAddCardModal, user, cardsRefreshKey, cards, cardsLoading, loadUserCards, refreshCards } = useGlobalContext()
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadUserCards()
  }, [user?.userId, cardsRefreshKey])

  useEffect(() => {
    console.log('Cards:', cards)
  }, [cards])

  const toggleMenu = (cardId) => {
    setOpenMenuId(openMenuId === cardId ? null : cardId)
  }

  const handleDelete = async (card) => {
    const cardId = card.id || card.cardId
    try {
      setDeleting(cardId)
      setOpenMenuId(null)
      await deleteCard(cardId)
      toast.success(t('myCards.cardDeleted') || 'Card deleted successfully')
      refreshCards()
    } catch (err) {
      console.error('Delete card error:', err)
      toast.error(err?.message || t('toast.networkError'))
    } finally {
      setDeleting(null)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

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
              const rawNum = typeof c.cardData.cardNumber === 'string' ? c.cardData.cardNumber : c.accountNumber
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
                    <div className='cardMenuWrapper'>
                      <button
                        type='button'
                        aria-label='Card menu'
                        className='cardMenuBtn'
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMenu(c.id || c.cardId || idx)
                        }}
                      >
                        •••
                      </button>
                      {openMenuId === (c.id || c.cardId || idx) && (
                        <div className='cardDropdown' onClick={(e) => e.stopPropagation()}>
                          <button
                            className='cardDropdownItem delete'
                            onClick={() => handleDelete(c)}
                            disabled={deleting === (c.id || c.cardId)}
                          >
                            {deleting === (c.id || c.cardId) ? (t('deleting') || 'Deleting...') : (t('delete') || 'Delete')}
                          </button>
                        </div>
                      )}
                    </div>
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
    </div>
  )
}

export default MyCards