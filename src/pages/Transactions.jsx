import React, { useState, useEffect, useRef } from 'react'
import './transactions.css'
import { useGlobalContext } from '../Context'
import { ArrowLeftRight, Check, Clock, List, MessagesSquare, MinusCircle, X } from 'lucide-react'
import { getExchangeRate, calculateTransactionFees } from '../api'

const Transactions = () => {
  let { t, theme, navigate, transactions, globalDropdownKey, closeAllDropdowns, profileCountriesList } = useGlobalContext()

  // Track if this component triggered the global close to avoid self-closing loop
  const selfTriggered = useRef(false)

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
  const allCurrencies = [
    { flag: 'https://img.icons8.com/color/96/usa-circular.png', currencyName: 'USD' },
    { flag: 'https://img.icons8.com/color/96/uzbekistan-circular.png', currencyName: 'UZS' },
    { flag: 'https://img.icons8.com/color/96/russian-federation-circular.png', currencyName: 'RUB' },
    { flag: 'https://img.icons8.com/fluency/96/european-union-circular-flag.png', currencyName: 'EUR' },
    { flag: 'https://img.icons8.com/color/96/great-britain-circular.png', currencyName: 'GBP' },
    { flag: 'https://img.icons8.com/color/96/turkey-circular.png', currencyName: 'TRY' },
    { flag: 'https://img.icons8.com/color/96/kazakhstan-circular.png', currencyName: 'KZT' }
  ]

  // Qabul qiluvchi uchun — faqat backend country lari bo'yicha
  const receiverCurrencies = profileCountriesList.length > 0
    ? allCurrencies.filter(cur =>
        profileCountriesList.some(c => c.currency?.toUpperCase() === cur.currencyName)
      )
    : allCurrencies

  // Crypto currencies (for receiving only)
  const cryptoCurrencies = [
    { code: 'USDT', name: 'Tether USD', icon: '💵' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDC', name: 'USD Coin', icon: '💲' },
    { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
  ]

  // Helper: get flag URL or emoji for a currency code
  const getCurrencyFlag = (code) => {
    if (!code) return null
    const fiat = allCurrencies.find(c => c.currencyName === code.toUpperCase())
    if (fiat) return { type: 'img', src: fiat.flag }
    const crypto = cryptoCurrencies.find(c => c.code === code.toUpperCase())
    if (crypto) return { type: 'emoji', icon: crypto.icon }
    return null
  }

  const [isMyTransCurOpen, setIsMyTransCurOpen] = useState(false)
  const [isOtheTransCurOpen, setIsOtheTransCurOpen] = useState(false)

  // Close local dropdowns when global close signal is triggered from other components
  useEffect(() => {
    if (globalDropdownKey > 0 && !selfTriggered.current) {
      setIsMyTransCurOpen(false)
      setIsOtheTransCurOpen(false)
    }
    selfTriggered.current = false
  }, [globalDropdownKey])
  const [myTransCur, setMyTransCur] = useState(currency[0])
  const [otherTransCur, setOtherTransCur] = useState(currency[1])

  // receiverCurrencies yuklanganida qabul qiluvchi valyuta listda yo'q bo'lsa reset
  useEffect(() => {
    if (receiverCurrencies.length === 0) return
    if (!receiverCurrencies.find(c => c.currencyName === otherTransCur.currencyName)) {
      setOtherTransCur(receiverCurrencies[0])
    }
  }, [receiverCurrencies.length])
  const [selectedCrypto, setSelectedCrypto] = useState(null) // null = fiat, object = crypto
  const [sendAmount, setSendAmount] = useState('0')
  const [receiveAmount, setReceiveAmount] = useState('0')
  const [openIndex, setOpenIndex] = useState(null);

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const isSwapping = useRef(false)
  const editingField = useRef(null)

  // Fee configuration
  const DEFAULT_TRANSFER_FEE = 10
  const DEFAULT_EXCHANGE_RATE_FEE = 2
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
        setCanCloseAd(false)
        localStorage.setItem("lastAdShown", now.toString())
      }
    }
  }, [regoffer])

  // Countdown timer - separate effect to avoid StrictMode cleanup issues
  useEffect(() => {
    if (!showAdBanner || canCloseAd) return

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
  }, [showAdBanner, canCloseAd])

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (myTransCur.currencyName === otherTransCur.currencyName) {
        setExchangeRate({ rate: 1 })
        return
      }

      try {
        setIsLoadingRate(true)
        const rateData = await getExchangeRate(myTransCur.currencyName, otherTransCur.currencyName)
        setExchangeRate(rateData)

        // Auto-calculate receive amount when rate is fetched (skip during swap)
        if (sendAmount && !isSwapping.current) {
          const amount = parseFloat(sendAmount.replace(/\s/g, ''))
          if (!isNaN(amount)) {
            const converted = amount * rateData.rate
            setReceiveAmount(converted.toLocaleString('en-US', { maximumFractionDigits: 2 }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
        setExchangeRate(null)
      } finally {
        setIsLoadingRate(false)
      }
    }

    fetchExchangeRate()
  }, [myTransCur.currencyName, otherTransCur.currencyName])

  // Update receive amount when send amount changes - WITH FEE CALCULATION
  useEffect(() => {
    if (isSwapping.current) return
    if (editingField.current === 'receive') return
    if (exchangeRate && sendAmount) {
      const amount = parseFloat(sendAmount.replace(/\s/g, ''))
      if (!isNaN(amount) && amount > 0) {
        const calculation = calculateTransactionFees(
          amount,
          DEFAULT_TRANSFER_FEE,
          DEFAULT_EXCHANGE_RATE_FEE,
          exchangeRate.rate
        )
        setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
      }
    }
  }, [sendAmount, exchangeRate])

  // Reverse: update send amount when receive amount changes
  useEffect(() => {
    if (isSwapping.current) return
    if (editingField.current !== 'receive') return
    if (exchangeRate && receiveAmount) {
      const received = parseFloat(receiveAmount.replace(/[,\s]/g, ''))
      if (!isNaN(received) && received > 0) {
        const adjustedRate = exchangeRate.rate * (1 - (DEFAULT_EXCHANGE_RATE_FEE || 0) / 100)
        const transferMultiplier = 1 - (DEFAULT_TRANSFER_FEE || 0) / 100
        if (adjustedRate > 0 && transferMultiplier > 0) {
          const computedSend = received / (adjustedRate * transferMultiplier)
          const rounded = Math.round(computedSend * 100) / 100
          setSendAmount(rounded.toString())
        }
      }
    }
  }, [receiveAmount, exchangeRate])

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
        <div className="transactions-transfer-cont">
          <div className='transactions-transfer-top'>
            <div className='transactions-transfer-top-cash'>
              <p>
                {t("yousend")}
              </p>
              <input
                type="text"
                value={sendAmount}
                onChange={(e) => {
                  editingField.current = 'send'
                  let val = e.target.value
                  val = val.replace(/[^0-9.]/g, '')
                  val = val.replace(/^0+(?=\d)/, '')
                  const parts = val.split('.')
                  if (parts.length > 2) {
                    val = parts[0] + '.' + parts.slice(1).join('')
                  }
                  if (parts.length === 2 && parts[1].length > 2) {
                    val = parts[0] + '.' + parts[1].slice(0, 2)
                  }
                  setSendAmount(val || '0')
                }}
              />
            </div>
            <div className="currTransDropdown">
              <button
                onClick={() => {
                  if (!isMyTransCurOpen) {
                    selfTriggered.current = true
                    closeAllDropdowns()
                  }
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
                  {allCurrencies.map((cur, index) => (
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
          <button type='button' className='changeTransBtn' onClick={() => {
              isSwapping.current = true
              // Swap amounts
              const tempAmount = sendAmount
              setSendAmount(receiveAmount.replace(/,/g, ''))
              setReceiveAmount(tempAmount)
              // Swap currencies
              const tempCur = myTransCur
              setMyTransCur(otherTransCur)
              setOtherTransCur(tempCur)
              // Clear crypto selection when swapping
              setSelectedCrypto(null)
              // Reset flags after state updates
              setTimeout(() => { isSwapping.current = false; editingField.current = null }, 100)
            }}>
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
                onChange={(e) => {
                  editingField.current = 'receive'
                  let val = e.target.value
                  val = val.replace(/[^0-9.]/g, '')
                  val = val.replace(/^0+(?=\d)/, '')
                  const parts = val.split('.')
                  if (parts.length > 2) {
                    val = parts[0] + '.' + parts.slice(1).join('')
                  }
                  if (parts.length === 2 && parts[1].length > 2) {
                    val = parts[0] + '.' + parts[1].slice(0, 2)
                  }
                  setReceiveAmount(val || '0')
                }}
              />
            </div>
            <div className="currTransDropdown">
              <button
                onClick={() => {
                  if (!isOtheTransCurOpen) {
                    selfTriggered.current = true
                    closeAllDropdowns()
                  }
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
                  {/* Fiat currencies — faqat backend country lari */}
                  {receiverCurrencies.map((cur, index) => (
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
                        <div className="transaction-currency-icons">
                          {(() => {
                            const fromFlag = getCurrencyFlag(transaction.currency)
                            const toFlag = getCurrencyFlag(transaction.currencyInOther)
                            return <>
                              {fromFlag?.type === 'img'
                                ? <img src={fromFlag.src} alt={transaction.currency} className="transaction-flag-main" />
                                : <span className="transaction-flag-main transaction-flag-emoji">{fromFlag?.icon || '?'}</span>
                              }
                              {toFlag?.type === 'img'
                                ? <img src={toFlag.src} alt={transaction.currencyInOther} className="transaction-flag-sub" />
                                : <span className="transaction-flag-sub transaction-flag-emoji">{toFlag?.icon || '?'}</span>
                              }
                            </>
                          })()}
                        </div>
                        <div>
                          <h4>
                            {(transaction.type === "send" ? transaction.receiverName : transaction.sanderName)
                              || transaction.receiverName
                              || transaction.sanderName
                              || t('transferBtn') || 'Перевод'}
                          </h4>
                          <p>
                            {transaction.receiverCardNumber
                              ? `${toCardResolved} ${transaction.receiverCardNumber.slice(-4)}`
                              : `${transaction.currency} → ${transaction.currencyInOther}`
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
                        <div className="transaction-currency-icons">
                          {(() => {
                            const fromFlag = getCurrencyFlag(transaction.currency)
                            const toFlag = getCurrencyFlag(transaction.currencyInOther)
                            return <>
                              {fromFlag?.type === 'img'
                                ? <img src={fromFlag.src} alt={transaction.currency} className="transaction-flag-main" />
                                : <span className="transaction-flag-main transaction-flag-emoji">{fromFlag?.icon || '?'}</span>
                              }
                              {toFlag?.type === 'img'
                                ? <img src={toFlag.src} alt={transaction.currencyInOther} className="transaction-flag-sub" />
                                : <span className="transaction-flag-sub transaction-flag-emoji">{toFlag?.icon || '?'}</span>
                              }
                            </>
                          })()}
                        </div>
                        <div>
                          <h4>
                            {(transaction.type === "send" ? transaction.receiverName : transaction.sanderName)
                              || transaction.receiverName
                              || transaction.sanderName
                              || t('transferBtn') || 'Перевод'}
                          </h4>
                          <p>
                            {transaction.receiverCardNumber
                              ? `${toCardResolved} ${transaction.receiverCardNumber.slice(-4)}`
                              : `${transaction.currency} → ${transaction.currencyInOther}`
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
