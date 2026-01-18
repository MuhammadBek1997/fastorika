import React, { useState, useEffect } from 'react'
import './transactions.css'
import { useGlobalContext } from '../Context'
import { ArrowLeftRight, Check, Clock, List, MessagesSquare, MinusCircle, X } from 'lucide-react'

const Transactions = () => {
  let { t, theme, navigate, transactions } = useGlobalContext()
  // Safe fallbacks for translations that were reported missing in list rows
  // Backend status mapping - same as admin panel
  const statusConfig = {
    TO_PAY: { key: 'toPay', icon: 'clock', class: 'toPay' },
    PROCESSING: { key: 'processing', icon: 'clock', class: 'processing' },
    DELIVERED: { key: 'delivered', icon: 'check', class: 'success' },
    REJECTED: { key: 'rejected', icon: 'minus', class: 'cancel' },
    SUPPORT: { key: 'support', icon: 'message', class: 'support' },
    // Legacy mapping for old data
    waiting: { key: 'processing', icon: 'clock', class: 'processing' },
    success: { key: 'delivered', icon: 'check', class: 'success' },
    cancel: { key: 'rejected', icon: 'minus', class: 'cancel' },
    support: { key: 'support', icon: 'message', class: 'support' }
  }

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.PROCESSING
  }

  const translateStatus = (statusKey) => {
    // Try multiple translation paths
    const paths = [
      `transactions.status.${statusKey}`,
      `transactionInfo.status.${statusKey}`,
      statusKey
    ]
    for (const path of paths) {
      const v = t(path)
      if (v !== path) return v
    }
    return statusKey
  }
  const toCardPrimary = t('transactions.toCard')
  const toCardResolved = toCardPrimary === 'transactions.toCard' ? t('global.toCard') : toCardPrimary
  // Fiat currencies
  const currency = [
    { flag: 'https://img.icons8.com/color/96/usa-circular.png', currencyName: 'USD' },
    { flag: 'https://img.icons8.com/color/96/uzbekistan-circular.png', currencyName: 'UZS' },
    { flag: 'https://img.icons8.com/color/96/russian-federation-circular.png', currencyName: 'RUB' },
    { flag: 'https://img.icons8.com/fluency/96/european-union-circular-flag.png', currencyName: 'EUR' },
    { flag: 'https://img.icons8.com/color/96/great-britain-circular.png', currencyName: 'GBP' },
    { flag: 'https://img.icons8.com/color/96/turkey-circular.png', currencyName: 'TRY' },
    { flag: 'https://img.icons8.com/color/96/kazakhstan-circular.png', currencyName: 'KZT' }
  ]

  // Crypto currencies (for receiving only)
  const cryptoCurrencies = [
    { code: 'USDT', name: 'Tether USD', icon: '💵' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDC', name: 'USD Coin', icon: '💲' },
    { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
  ]

  const [isMyTransCurOpen, setIsMyTransCurOpen] = useState(false)
  const [isOtheTransCurOpen, setIsOtheTransCurOpen] = useState(false)
  const [myTransCur, setMyTransCur] = useState(currency[0])
  const [otherTransCur, setOtherTransCur] = useState(currency[1])
  const [selectedCrypto, setSelectedCrypto] = useState(null) // null = fiat, object = crypto
  const [changeTransCards, setChangeTransCards] = useState(false)
  const [sendAmount, setSendAmount] = useState('1000')
  const [receiveAmount, setReceiveAmount] = useState('12560000')
  const [openIndex, setOpenIndex] = useState(null);
  const [regoffer, setRegoffer] = useState(localStorage.getItem("regoffer") || "show")

  // Fastorika ID ad banner states
  const [showAdBanner, setShowAdBanner] = useState(false)
  const [canCloseAd, setCanCloseAd] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Check if we should show ad banner (1 hour interval)
  useEffect(() => {
    if (regoffer === "hide") {
      const lastAdShown = localStorage.getItem("lastAdShown")
      const now = Date.now()

      if (!lastAdShown || now - parseInt(lastAdShown) >= 3600000) { // 1 hour = 3600000ms
        setShowAdBanner(true)
        setCountdown(5)
        localStorage.setItem("lastAdShown", now.toString())

        // Countdown timer
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              setCanCloseAd(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(interval)
      }
    }
  }, [regoffer])

  const handleRegoffer = () => {
    localStorage.setItem("regoffer", "hide");
    setRegoffer("hide")
  }

  const handleCloseAdBanner = () => {
    if (canCloseAd) {
      setShowAdBanner(false)
      setCanCloseAd(false)
    }
  }

  return (
    <div className='transactions' id='webSection'>
      <div className="transactions-navbar">
        <div className={`transactions-transfer-cont ${!changeTransCards ? "transrow" : "transreverse"}`}>
          <div className='transactions-transfer-top'>
            <div className='transactions-transfer-top-cash'>
              <p>
                {t("yousend")}
              </p>
              <input
                type="text"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            <div className="currTransDropdown">
              <button
                onClick={() => {
                  setIsMyTransCurOpen(!isMyTransCurOpen)
                  setIsOtheTransCurOpen(false)
                }}
                className="currTransToggle"
              >
                <img src={myTransCur.flag} alt="" className="currImg" />
                <span className="currCode">{myTransCur?.currencyName.toUpperCase()}</span>
                <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>

              {isMyTransCurOpen && (
                <div className="currTransDropdownMenu">
                  {currency.map((cur, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setMyTransCur(cur)
                        setIsMyTransCurOpen(false)
                      }}
                      className={`currOption ${myTransCur.currencyName === cur.currencyName ? 'active' : ''}`}
                    >
                      <img src={cur.flag} alt="" className="currImg" />
                      <span>{cur.currencyName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button type='button' className='changeTransBtn' onClick={() => { setChangeTransCards(!changeTransCards) }}>
           <ArrowLeftRight/>
          </button>
          <div className='transactions-transfer-bottom'>
            <div className='transactions-transfer-bottom-cash'>
              <p>
                {t("willtake")}
              </p>
              <input
                type="text"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
              />
            </div>
            <div className="currTransDropdown">
              <button
                onClick={() => {
                  setIsOtheTransCurOpen(!isOtheTransCurOpen)
                  setIsMyTransCurOpen(false)
                }}
                className="currTransToggle"
              >
                {selectedCrypto ? (
                  <>
                    <span style={{ fontSize: '1.25rem' }}>{selectedCrypto.icon}</span>
                    <span className="currCode">{selectedCrypto.code}</span>
                  </>
                ) : (
                  <>
                    <img src={otherTransCur.flag} alt="" className="currImg" />
                    <span className="currCode">{otherTransCur?.currencyName.toUpperCase()}</span>
                  </>
                )}
                <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>

              {isOtheTransCurOpen && (
                <div className="currTransDropdownMenu">
                  {/* Fiat currencies */}
                  {currency.map((cur, index) => (
                    <button
                      key={`fiat-${index}`}
                      onClick={() => {
                        setOtherTransCur(cur)
                        setSelectedCrypto(null)
                        setIsOtheTransCurOpen(false)
                      }}
                      className={`currOption ${!selectedCrypto && otherTransCur.currencyName === cur.currencyName ? 'active' : ''}`}
                    >
                      <img src={cur.flag} alt="" className="currImg" />
                      <span>{cur.currencyName}</span>
                    </button>
                  ))}
                  {/* Divider */}
                  <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.5rem 0' }}></div>
                  {/* Crypto currencies */}
                  {cryptoCurrencies.map((crypto) => (
                    <button
                      key={`crypto-${crypto.code}`}
                      onClick={() => {
                        setSelectedCrypto(crypto)
                        setIsOtheTransCurOpen(false)
                      }}
                      className={`currOption ${selectedCrypto?.code === crypto.code ? 'active' : ''}`}
                    >
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{crypto.icon}</span>
                      <span>{crypto.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button className='transactions-transferBtn' onClick={() => {
          // Start transfer flow regardless of login, do not clear auth
          localStorage.setItem('pending', true)
          navigate('/currency')
        }}>
          {t("transBtn")}
        </button>
      </div>
      <div className="transaction-body">
        {regoffer == "show" && (
          <div className='transaction-registr-offer'>
            <div className='transaction-reg-of-top'>
              Fastorika
              <div className="transaction-reg-of-img">
                id
              </div>
            </div>
            <div className='transaction-reg-of-bottom'>
              <div className='transaction-reg-of-left'>
                <p>
                  {t('transactions.regOffer.desc')}
                </p>
              </div>
              <div className='transaction-reg-of-right'>
                <button onClick={handleRegoffer}>
                  {t('transactions.regOffer.close')}
                </button>
                <button onClick={() => navigate('/kyc')}>
                  {t('transactions.regOffer.verify')}
                </button>
              </div>
            </div>
          </div>
        )}

        {regoffer == "hide" && showAdBanner && (
          <div className='transaction-ad-banner'>
            <button
              className={`ad-banner-close ${!canCloseAd ? 'disabled' : ''}`}
              onClick={handleCloseAdBanner}
              disabled={!canCloseAd}
            >
              {!canCloseAd ? (
                <span className="countdown-timer">{countdown}</span>
              ) : (
                <X size={20} />
              )}
            </button>
            <div className='transaction-ad-content'>
              <div className='transaction-ad-left'>
                <div className='transaction-ad-logo'>
                  Fastorika
                  <div className="transaction-ad-logo-id">
                    ID
                  </div>
                </div>
                <p>
                  {t('fastorikaIdShare.description')}
                </p>
              </div>
              <div className='transaction-ad-right'>
                <button className='ad-share-btn'>
                  {t('fastorikaIdShare.shareButton')}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className='transaction-list'>
          <table className='transaction-table'>
            <thead>
              <tr>
                <th style={{ paddingLeft: "1rem" }}>{t('transactions.table.recipient')}</th>
                <th style={{ paddingLeft: "15vw" }}>{t('transactions.table.created')}</th>
                <th style={{ paddingLeft: "5vw" }}>{t('transactions.table.amountToSend')}</th>
                <th>{t('transactions.table.amountToReceive')}</th>
                <th style={{ paddingRight: "7vw" }}>{t('transactions.table.status')}</th>
              </tr>
            </thead>
            <tbody>
  {transactions.length > 0 &&
    transactions.map((transaction, index) => {
      const statusInfo = getStatusInfo(transaction.status)
      return (
      <>
                    <tr key={index} className='transaction-list-rowD' onClick={() => navigate(`transaction/${transaction.id}`)}>
                      <td className='transaction-list-name'>
                        <div>
                          <img src={`/images/transicon${theme}.png`} alt="icon" />
                        </div>
                        <div>
                          <h4>
                            {transaction.type === "send" ? transaction.receiverName : transaction.sanderName}
                          </h4>
                          <p>
                            {transaction.receiverCardNumber
                              ? `${toCardResolved} ${transaction.receiverCardNumber.slice(-4)}`
                              : transaction.currencyInOther
                            }
                          </p>
                        </div>

                      </td>
                      <td className='transaction-list-date' style={{ paddingLeft: "15vw" }}>
                        {transaction.date}
                        <p>
                          {t("at")}{transaction.time}
                        </p>
                      </td>
                      <td className='transaction-list-currency' style={{ paddingLeft: "5vw" }}>
                        {transaction.amount} {transaction.currency}
                      </td>
                      <td className='transaction-list-otherCur'>
                        {transaction.amountInOther} {transaction.currencyInOther}
                      </td>
                      <td className={`transaction-list-status ${statusInfo.class}`}>
                        <div>
                          {statusInfo.icon === 'clock' && <Clock size={15} />}
                          {statusInfo.icon === 'check' && <Check size={15} />}
                          {statusInfo.icon === 'minus' && <MinusCircle size={15} />}
                          {statusInfo.icon === 'message' && <MessagesSquare size={15} />}
                          <p>
                            {translateStatus(statusInfo.key)}
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr key={`M${index}`} className='transaction-list-rowM' onClick={() => navigate(`transaction/${transaction.id}`)}>
                      <td className='transaction-list-name'>
                        <div>
                          <img src={`/images/transicon${theme}.png`} alt="icon" />
                        </div>
                        <div>
                          <h4>
                            {transaction.type === "send" ? transaction.receiverName : transaction.sanderName}
                          </h4>
                          <p>
                            {transaction.receiverCardNumber
                              ? `${toCardResolved} ${transaction.receiverCardNumber.slice(-4)}`
                              : transaction.currencyInOther
                            }
                          </p>
                        </div>

                      </td>
                      <td className='transaction-list-date'>
                        <h5>
                        {transaction.date}
                        </h5>
                        <div className={`transaction-list-status ${statusInfo.class}`}>
                          <div>
                            {statusInfo.icon === 'clock' && <Clock size={15} />}
                            {statusInfo.icon === 'check' && <Check size={15} />}
                            {statusInfo.icon === 'minus' && <MinusCircle size={15} />}
                            {statusInfo.icon === 'message' && <MessagesSquare size={15} />}
                          </div>
                          <p>
                          -{transaction.amountInOther} {transaction.currencyInOther}
                        </p>
                        </div>

                      </td>
                    </tr>

                  </>
                )})
              }
              {
                transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className='no-transactions'>
                      <div className='empty-state'>
                        <div className='empty-state-icon'>
                          <List />
                        </div>
                        <p>{t('transactions.noTransactions')}</p>
                      </div>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Transactions
