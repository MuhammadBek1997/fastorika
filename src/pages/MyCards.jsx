import { useEffect } from 'react'
import { useGlobalContext } from '../Context'
import AddCardModal from './AddCardModal'
import './mycards.css'

const MyCards = () => {
  let { t, theme, addCardModal, setAddCardModal, user, cardsRefreshKey, cards, cardsLoading, loadUserCards } = useGlobalContext()

  useEffect(() => {
    loadUserCards()
  }, [user?.userId, cardsRefreshKey])

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
              const masked = last4 ? `**    ${last4}` : ''
              // Prefer structured expiryMonth/expiryYear if available, fallback to text fields
              const mm = c?.expiryMonth
              const yy = c?.expiryYear
              const expiry = (mm != null && yy != null)
                ? `${String(mm).padStart(2, '0')}/${String(String(yy).slice(-2)).padStart(2, '0')}`
                : (c.expire || c.expiry || c.expireDate || '11/25')
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
                    <button type='button' aria-label='Menu' className='cardMenuBtn'>•••</button>
                  </div>

                  <div className='cardNumber'>
                    <p className='cardNumberText'>{masked || '**** **** **** ****'}</p>
                  </div>

                  <div className='cardFooter'>
                    <div className='cardMeta'>
                      <span className='cardExpiry'>{expiry}</span>
                      <span className='cardBrand'>{brand}</span>
                      <span className='cardCountry'>{c.country?.name || c.countryName || ''}</span>
                    </div>
                    <span aria-hidden='true' className='statusDot' />
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