import { useState, useEffect, useRef } from 'react'
import { useGlobalContext } from '../Context'
import { ArrowUpDown, Banknote, Bitcoin, ChevronDown, ChevronRight, CreditCard, Info, LucideBanknoteArrowUp, X } from 'lucide-react'
import { getExchangeRate, calculateTransactionFees, getAllCountries, getCountryFees } from '../api'
import SEO from '../components/SEO'

const Home = () => {

  let { t, theme, faqData,toggleAccordion,openIndex,navigate } = useGlobalContext()

  // Dynamic fee state (loaded from backend per country)
  const [transferFee, setTransferFee] = useState(0)
  const [exchangeRateFee, setExchangeRateFee] = useState(0)
  const [countryMap, setCountryMap] = useState({}) // currency → country
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)

  let currency = [
    {
      flag: 'https://img.icons8.com/color/96/usa-circular.png',
      currencyName: 'USD'
    },
    {
      flag: 'https://img.icons8.com/color/96/uzbekistan-circular.png',
      currencyName: 'UZS'
    },
    {
      flag: 'https://img.icons8.com/color/96/russian-federation-circular.png',
      currencyName: 'RUB'
    },
    {
      flag: 'https://img.icons8.com/fluency/96/european-union-circular-flag.png',
      currencyName: 'EUR'
    },
    {
      flag: 'https://img.icons8.com/color/96/great-britain-circular.png',
      currencyName: 'GBP'
    },
    {
      flag: 'https://img.icons8.com/color/96/turkey-circular.png',
      currencyName: 'TRY'
    },
    {
      flag: 'https://img.icons8.com/color/96/kazakhstan-circular.png',
      currencyName: 'KZT'
    }
  ]


  const [isMyCurOpen, setIsMyCurOpen] = useState(false)
  const [isOtheCurOpen, setIsOtheCurOpen] = useState(false)
  const [myCur, setMyCur] = useState(currency[0])
  const [otherCur, setOtherCur] = useState(currency[1])
    const [sendAmount, setSendAmount] = useState('0')
  const [receiveAmount, setReceiveAmount] = useState('0')
  const [isMethodOpen, setIsMethodOpen] = useState(false)
  const [curMethod, setMethod] = useState("")
  const [exchangeRate, setExchangeRate] = useState(null)
  const [isLoadingRate, setIsLoadingRate] = useState(false)
  const [feeCalculation, setFeeCalculation] = useState(null)
  const isSwapping = useRef(false)
  const lastEdited = useRef('send') // 'send' yoki 'receive' — qaysi input oxirgi o'zgartirilgan

  // Crypto state
  const cryptoCurrencies = [
    { code: 'USDT', name: 'Tether USD', icon: '💵' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDC', name: 'USD Coin', icon: '💲' },
    { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
  ]
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoCurrencies[0])
  const [isCryptoOpen, setIsCryptoOpen] = useState(false)

  const methods = [
    t('methods.debit'),
    t('methods.crypto'),
    t('methods.bank')
  ]

  const handleMethodSelect = (method) => {
    setMethod(method)
    setIsMethodOpen(false)
  }

  // Load countries on mount → build currency→country map
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getAllCountries()
        if (Array.isArray(countries)) {
          const map = {}
          countries.forEach(c => {
            if (c.currency) map[c.currency.toUpperCase()] = c
          })
          setCountryMap(map)
        }
      } catch (err) {
        console.error('Failed to load countries:', err)
      }
    }
    loadCountries()
  }, [])

  // Fetch fees when receiver currency changes
  useEffect(() => {
    const fetchFees = async () => {
      const country = countryMap[otherCur.currencyName]
      if (country?.id) {
        const fees = await getCountryFees(country.id)
        setTransferFee(fees.transferFeePercentage || 0)
        setExchangeRateFee(fees.exchangeRateFeePercentage || 0)
      } else {
        setTransferFee(0)
        setExchangeRateFee(0)
      }
    }
    if (Object.keys(countryMap).length > 0) {
      fetchFees()
    }
  }, [otherCur.currencyName, countryMap])

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (myCur.currencyName === otherCur.currencyName) {
        setExchangeRate({ rate: 1 })
        return
      }

      try {
        setIsLoadingRate(true)
        const rateData = await getExchangeRate(myCur.currencyName, otherCur.currencyName)
        setExchangeRate(rateData)

        // Auto-calculate when rate is fetched (skip during swap)
        if (!isSwapping.current) {
          if (lastEdited.current === 'receive' && receiveAmount) {
            const received = parseFloat(receiveAmount.replace(/\s/g, ''))
            if (!isNaN(received) && received > 0) {
              const adjustedRate = rateData.rate * (1 - exchangeRateFee / 100)
              const transferMultiplier = 1 - transferFee / 100
              const computedSend = received / (adjustedRate * transferMultiplier)
              setSendAmount(Math.round(computedSend * 100) / 100 + '')
            }
          } else if (sendAmount) {
            const amount = parseFloat(sendAmount.replace(/\s/g, ''))
            if (!isNaN(amount) && amount > 0) {
              const calculation = calculateTransactionFees(amount, transferFee, exchangeRateFee, rateData.rate)
              setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
            }
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
  }, [myCur.currencyName, otherCur.currencyName])

  // Re-calculate when fees change (backend loaded new fees for selected country)
  useEffect(() => {
    if (isSwapping.current || !exchangeRate) return
    const amount = parseFloat((sendAmount || '0').replace(/\s/g, ''))
    if (!isNaN(amount) && amount > 0) {
      const calculation = calculateTransactionFees(amount, transferFee, exchangeRateFee, exchangeRate.rate)
      setFeeCalculation(calculation)
      setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
    }
  }, [transferFee, exchangeRateFee])

  // Update receive amount when send amount changes - WITH FEE CALCULATION
  useEffect(() => {
    if (isSwapping.current) return
    if (lastEdited.current !== 'send') return
    if (exchangeRate && sendAmount) {
      const amount = parseFloat(sendAmount.replace(/\s/g, ''))
      if (!isNaN(amount) && amount > 0) {
        const calculation = calculateTransactionFees(
          amount,
          transferFee,
          exchangeRateFee,
          exchangeRate.rate
        )
        setFeeCalculation(calculation)
        setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
      }
    }
  }, [sendAmount, exchangeRate])

  // Teskari hisoblash: receive → send
  useEffect(() => {
    if (isSwapping.current) return
    if (lastEdited.current !== 'receive') return
    if (exchangeRate && receiveAmount) {
      const received = parseFloat(receiveAmount.replace(/\s/g, ''))
      if (!isNaN(received) && received > 0) {
        // amountReceived = amountSent * (1 - transferFee/100) * rate * (1 - exchangeFee/100)
        const adjustedRate = exchangeRate.rate * (1 - exchangeRateFee / 100)
        const transferMultiplier = 1 - transferFee / 100
        const computedSend = received / (adjustedRate * transferMultiplier)
        const rounded = Math.round(computedSend * 100) / 100
        setSendAmount(rounded.toLocaleString('en-US', { maximumFractionDigits: 2 }))
        // Fee hisoblash (send summasidan)
        const calculation = calculateTransactionFees(
          rounded,
          transferFee,
          exchangeRateFee,
          exchangeRate.rate
        )
        setFeeCalculation(calculation)
      }
    }
  }, [receiveAmount, exchangeRate])



  return (
    <>
      <SEO
        title="Fastorika"
        description="Send money internationally with Fastorika. Fast, secure and low-cost transfers to bank accounts, cards and crypto wallets worldwide. Available 24/7."
        canonical="https://fastorika.com/"
      />
      <section>
        <div className='hero'>
        <div className='hero-left'>
          <h1>
            {t("heroHead")}
          </h1>
          <p>
            {t("heroSecond")}
          </p>
          <div className='hero-func-list'>
            <div className='hero-func-list-item'>
              <img src="/images/hero-card.png" alt="cardTransfer" />
              <h3>
                {t("cardtransfer")}
              </h3>
            </div>
            <div className='hero-func-list-item'>
              <img src="/images/hero-crypto.png" alt="cryptoTransfer" />
              <h3>
                {t("cryptotransfer")}
              </h3>
            </div>
            <div className='hero-func-list-item'>
              <img src="/images/hero-bank.png" alt="bankAccount" />
              <h3>
                {t("banktransfer")}
              </h3>
            </div>
          </div>
        </div>
        <div className='hero-right'>
          <div className='hero-transfer-cont'>
            <div className='hero-transfer-top'>
              <div className='hero-transfer-top-cash'>
                <p>
                  {t("yousend")}
                </p>
                <input
                  type="text"
                  value={sendAmount}
                  onChange={(e) => {
                    lastEdited.current = 'send'
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
              <div className="currDropdown">
                <button
                  onClick={() => {
                    setIsMyCurOpen(!isMyCurOpen)
                    // Boshqa dropdownlarni yopish
                    setIsOtheCurOpen(false)
                    setIsCryptoOpen(false)
                    setIsMethodOpen(false)
                  }}
                  className="currToggle"

                >
                  <img src={myCur.flag} alt="" className="currImg" />
                  <span className="currCode">{myCur?.currencyName.toUpperCase()}</span>
                  <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {isMyCurOpen && (
                  <div className="currDropdownMenu">
                    {currency.map((cur, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setMyCur(cur)
                          setIsMyCurOpen(false)
                        }}
                        className={`currOption ${myCur.currencyName === cur.currencyName ? 'active' : ''}`}
                      >
                        <img src={cur.flag} alt="" className="currImg" />
                        <span>{cur.currencyName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button type='button' className='changeBtn' onClick={() => {
              isSwapping.current = true
              // Swap amounts
              const tempAmount = sendAmount
              setSendAmount(receiveAmount.replace(/,/g, ''))
              setReceiveAmount(tempAmount)
              // Swap currencies
              const tempCur = myCur
              setMyCur(otherCur)
              setOtherCur(tempCur)
              // Reset flag after state updates
              setTimeout(() => { isSwapping.current = false }, 100)
            }}>
              <ArrowUpDown/>
            </button>
            <div className='hero-transfer-bottom'>
              <div className='hero-transfer-bottom-cash'>
                <p>
                  {t("willtake")}
                </p>
                <input
                  type="text"
                  value={receiveAmount}
                  onChange={(e) => {
                    lastEdited.current = 'receive'
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
              <div className="currDropdown">
                {/* Show crypto dropdown when crypto method is selected */}
                {curMethod === t('methods.crypto') ? (
                  <>
                    <button
                      onClick={() => {
                        setIsCryptoOpen(!isCryptoOpen)
                        // Boshqa dropdownlarni yopish
                        setIsMyCurOpen(false)
                        setIsOtheCurOpen(false)
                        setIsMethodOpen(false)
                      }}
                      className="currToggle"
                    >
                      <span style={{ fontSize: '1.25rem' }}>{selectedCrypto.icon}</span>
                      <span className="currCode">{selectedCrypto.code}</span>
                      <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                      </svg>
                    </button>
                    {isCryptoOpen && (
                      <div className="currDropdownMenu">
                        {cryptoCurrencies.map((crypto) => (
                          <button
                            key={crypto.code}
                            onClick={() => {
                              setSelectedCrypto(crypto)
                              setIsCryptoOpen(false)
                            }}
                            className={`currOption ${selectedCrypto.code === crypto.code ? 'active' : ''}`}
                          >
                            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{crypto.icon}</span>
                            <span>{crypto.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsOtheCurOpen(!isOtheCurOpen)
                        // Boshqa dropdownlarni yopish
                        setIsMyCurOpen(false)
                        setIsCryptoOpen(false)
                        setIsMethodOpen(false)
                      }}
                      className="currToggle"
                    >
                      <img src={otherCur.flag} alt="" className="currImg" />
                      <span className="currCode">{otherCur?.currencyName.toUpperCase()}</span>
                      <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                      </svg>
                    </button>

                    {isOtheCurOpen && (
                      <div className="currDropdownMenu">
                        {currency.map((cur, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setOtherCur(cur)
                              setIsOtheCurOpen(false)
                            }}
                            className={`currOption ${otherCur.currencyName === cur.currencyName ? 'active' : ''}`}
                          >
                            <img src={cur.flag} alt="" className="currImg" />
                            <span>{cur.currencyName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {exchangeRate && myCur.currencyName !== otherCur.currencyName && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
              }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  1 {myCur.currencyName} = {(feeCalculation?.adjustedExchangeRate || (exchangeRate.rate * (1 - exchangeRateFee / 100))).toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCur.currencyName}
                </span>
                <span
                  
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:"space-between",
                    opacity: 0.8
                  }}
                  title={t("feeDetails") || "Fee details"}
                >
                  <Info size={16} onClick={() => setIsFeeModalOpen(true)}/>
                </span>
              </div>
            )}
          <div className="hero-right-cardInfo">
            <h3>
              {t("payMethod")}
            </h3>
            <div className="hero-method-container">
              <button
                onClick={() => {
                  setIsMethodOpen(!isMethodOpen)
                  // Boshqa dropdownlarni yopish
                  setIsMyCurOpen(false)
                  setIsOtheCurOpen(false)
                  setIsCryptoOpen(false)
                }}
                className="hero-method-btn"
              >
                {
                  curMethod !== "" ?
                    <div className="currency-selected-method">
                      <div className='methodIcon'>
                        {curMethod === t('methods.debit') && (
                          <CreditCard/>
                        )}
                        {curMethod === t('methods.crypto') && (
                          <Bitcoin/>
                        )}
                        {curMethod === t('methods.bank') && (
                          <LucideBanknoteArrowUp/>
                        )}
                      </div>
                      <div className='methodInfo'>
                        <h3>
                          {curMethod}
                        </h3>
                        {curMethod === t('methods.debit') && (
                          <p>{t('cardsListDesc')}</p>
                        )}
                        {curMethod === t('methods.crypto') && (
                          <p>{t('cryptoListDesc')}</p>
                        )}
                        {curMethod === t('methods.bank') && (
                          <p>{t("bankTransferDesc")}</p>
                        )}
                      </div>
                    </div>
                    :
                    <div className="currency-selected-method">
                      <div className='methodIcon'>
                        <CreditCard/>
                      </div>
                      <div className='methodInfo'>
                        <h3>
                          {t("noCard")}
                        </h3>
                        <p>
                          {t('cardsListDesc')}
                        </p>
                      </div>
                    </div>
                }

                <ChevronRight size={16} style={{ transform: isMethodOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {isMethodOpen && (
                <div className="hero-method-dropdown">
                  {methods.map((method, index) => (
                    <button
                      key={index}
                      onClick={() => handleMethodSelect(method)}
                      className={`hero-method-option ${curMethod === method ? 'active' : ''}`}
                    >
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className='hero-right-transferBtn'>
            {/* Adjusted exchange rate with info icon */}
            

            {/* Fee Details Modal */}
            {isFeeModalOpen && (
              <div className="fee-modal-overlay" onClick={() => setIsFeeModalOpen(false)}>
                <div className="fee-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="fee-modal-header">
                    <h3>{t("exchangeRate") || "Exchange Rate"}</h3>
                    <button className="fee-modal-close" onClick={() => setIsFeeModalOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="fee-modal-body">
                    {/* Base rate */}
                    <div className="fee-modal-row">
                      <span className="fee-label">{t("baseRate") || "Market rate"}</span>
                      <span className="fee-value">
                        1 {myCur.currencyName} = {exchangeRate?.rate?.toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCur.currencyName}
                      </span>
                    </div>

                    {/* Transfer fee */}
                    {transferFee > 0 && (
                      <div className="fee-modal-row">
                        <span className="fee-label">{t("fee")} ({t("transferFee") || "Transfer"})</span>
                        <span className="fee-value negative">-{transferFee}%</span>
                      </div>
                    )}

                    {/* Transfer fee amount */}
                    {feeCalculation && transferFee > 0 && (
                      <div className="fee-modal-row">
                        <span className="fee-label">{t("feeCount") || "Fee amount"}</span>
                        <span className="fee-value negative">
                          -{feeCalculation.transferFeeAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {myCur.currencyName}
                        </span>
                      </div>
                    )}

                    {/* Exchange rate fee */}
                    {exchangeRateFee > 0 && (
                      <div className="fee-modal-row">
                        <span className="fee-label">{t("exchangeRateFee") || "Exchange rate fee"}</span>
                        <span className="fee-value negative">-{exchangeRateFee}%</span>
                      </div>
                    )}

                    <hr className="fee-modal-divider" />

                    {/* Final adjusted rate */}
                    <div className="fee-modal-result">
                      <span className="fee-label">{t("yourRate") || "Your rate"}</span>
                      <span className="fee-value">
                        1 {myCur.currencyName} = {(feeCalculation?.adjustedExchangeRate || (exchangeRate?.rate * (1 - exchangeRateFee / 100))).toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCur.currencyName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={()=>{
              // Start transfer flow without wiping storage
              localStorage.setItem("pending", true)
              // Save transfer data to pass to next page
              const transferData = {
                sendAmount,
                receiveAmount,
                fromCurrency: myCur.currencyName,
                toCurrency: otherCur.currencyName,
                fromFlag: myCur.flag,
                toFlag: otherCur.flag,
                paymentMethod: curMethod || t("noCard"),
                exchangeRate: exchangeRate?.rate || null,
                exchangeRateTimestamp: exchangeRate?.timestamp || null,
                // Fee calculation data
                feeCalculation: feeCalculation || null,
                transferFeePercentage: transferFee,
                exchangeRateFeePercentage: exchangeRateFee
              }
              navigate('/currency', { state: transferData })
            }}>
              {t("transferBtn")}
            </button>
          </div>
        </div>
      </div>
      <div className='services'>
        <div className="service-steps">
          <div className="serviceStep">
            <h3>
              {t("servicestep1")}
            </h3>
            <p>
              {t("servicestep1p")}
            </p>
          </div>
          <div className="serviceStep">
            <h3>
              {t("servicestep2")}
            </h3>
            <p>
              {t("servicestep2p")}
            </p>
          </div>
          <div className="serviceStep">
            <h3>
              {t("servicestep3")}
            </h3>
            <p>
              {t("servicestep3p")}
            </p>
          </div>
        </div>
      </div>
      <div className='transferanywere'>
        <div className='transferanywere-textCont'>
          <div className='transferanywere-head'>
            <img src="/images/transferanywereIcon.png" alt="" />
            <h4>
              {t("unlimitedTransfer")}
            </h4>
          </div>
          <h2>
            {t("transferanywere1")}
            <span className='coloredanywere'><br />{t("transferanywere2")}</span>
            {t("transferanywere3")}
          </h2>
          <p>
            {t("transferanywere")}
          </p>
        </div>
        <div className='transferanywere-img'>
          <img src="/images/globusMobile.png" alt="" className='forM' />
          <img src="/images/transferanywerePhoto.png" alt="" className='forD' />
        </div>
      </div>
      <div className='fasttransfer'>
        <div className='fasttransfer-textCont'>
          <div className='fasttransfer-head'>
            <img src="/images/fasttransferIcon.png" alt="" />
            <h4>
              {t("fasttransferID")}
            </h4>
          </div>
          <h2>
            {t("fasttransfer1")} <span className='coloredfast'>{t("fasttransfer2")}</span>
          </h2>
          <p>
            {t("fasttransfer")}
          </p>
        </div>
        <div className='fasttransfer-img'>
          <img src={`/images/fasttransferPhoto${theme}.png`} alt="" />
        </div>
        <div className="fasttransfer-cards">
          <div className="fasttransfer-card">
              <div className="fasttransfer-card-number">
                5+
              </div>
              <h3>
                {t("yearsOnMarket") || "Года на рынке"}
              </h3>
          </div>
          <div className="fasttransfer-card">
              <div className="fasttransfer-card-number">
                10K+
              </div>
              <h3>
                {t("successfulTransfers") || "Успешных переводов"}
              </h3>
          </div>
          <div className="fasttransfer-card">
              <div className="fasttransfer-card-number">
                50+
              </div>
              <h3>
                {t("countriesWeWork") || "Стран, где мы работаем"}
              </h3>
          </div>
        </div>
      </div>
      <div className='ourapp'>
        <div className='ourapp-textCont'>
          <div className='ourapp-rating'>
            <div className='appstore-rating'>
              <img src="/images/appstoremini.png" alt="" />
              <img src="/images/star.png" alt="" />
              <p>
                4.8
              </p>
            </div>
            <div className='googleplay-rating'>
              <img src="/images/googleplaymini.png" alt="" />
              <img src="/images/star.png" alt="" />
              <p>
                4.7
              </p>
            </div>
          </div>
          <h2>
            {t("ourapp1")}
          </h2>
          <p className='ourapp-second'>
            {t("ourapp")}
          </p>
          <div className='ourapp-bottom'>
            <a href="">
              <img src="/images/ourapp1.png" alt="" />
            </a>
            <a href="">
              <img src="/images/ourapp2.png" alt="" />
            </a>
          </div>
        </div>
        <div className='forD'>
          <img src="/images/iPhone14Pro.png" alt="" />
        </div>
      </div>
      <div className='ursecurity'>
        <div className='ursecurity-top'>
          <div className='ursecurity-top-left'>
            <div className='ursecurity-head'>
              <img src="/images/ursecurityIcon.png" alt="" />
              <h4>
                {t("ursechead")}
              </h4>
            </div>
            <h2>
              {t("ursec1")}<span className='forD'> — </span><span className='colorsec'>{t("ursec2")}</span>{t("ursec3")}
            </h2>
          </div>
          <div className='ursecurity-top-right'>
            <img src={`/images/ursecTop${theme}.png`} alt="" className='forD' />
            <img src={`/images/ursecTopM${theme}.png`} alt="" className='forM' />
          </div>
        </div>
        <div className='ursecurity-bottom'>
          <div className='ursecurity-card'>
            <img src="/images/datasecIcon.png" alt="" />
            <h4>
              {t("datasec")}
            </h4>
            <p>
              {t("datasec2")}
            </p>
          </div>
          <div className='ursecurity-card'>
            <img src="/images/lisenseIcon.png" alt="" />
            <h4>
              {t("lisense")}
            </h4>
            <p>
              {t("lisense2")}
            </p>
          </div>
          <div className='ursecurity-card'>
            <img src="/images/defsecIcon.png" alt="" />
            <h4>
              {t("defsec")}
            </h4>
            <p>
              {t("defsec2")}
            </p>
          </div>
        </div>
      </div>
      <div className='faq' id='faq'>
        <div className='faq-left'>
          <h2>
            {t("faqhead")}
          </h2>
          <p>
            {t("faqsecond")}
          </p>
          <a href="" className='faq-ancor'>
            <div>
              <img src="/images/faqIcon.png" alt="" />
              {t("faqancor")}
            </div>
            <ChevronRight />
          </a>
        </div>
        <div className="faq-accordion">
          {faqData.map((faq, index) => (
            <div key={index} className="accordion-card">
              <div
                className="accordion-title"
                onClick={() => toggleAccordion(index)}
              >
                <h3>{faq.question}</h3>
                <ChevronDown className={openIndex === index ? 'rotate' : ''} />
              </div>

              <div className={`accordion-body ${openIndex === index ? 'open' : ''}`}>
                <div className="accordion-body-content">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}

export default Home