import { useState, useEffect } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ArrowUpDown, ChevronRight, CreditCard, Wallet, AlertCircle } from "lucide-react"
import { getExchangeRate, calculateTransactionFees, getUserCards } from "../api"


const UnRegCur = () => {

    let { t, theme } = useGlobalContext()
    const navigate = useNavigate()
    const location = useLocation()

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
            flag: 'https://img.icons8.com/color/96/european-union.png',
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
    const methods = [
        t('methods.debit'),
        t('methods.crypto'),
        t('methods.bank')
    ]

    const handleMethodSelect = (state) => {
        setMethod(state)
        setIsMethodOpen(false)
    }

    const [isMethodOpen, setIsMethodOpen] = useState(false)
    const [curMethod, setMethod] = useState("")
    const [selMeth, setSelMeth] = useState({})
    const [isMyCurrencyOpen, setIsMyCurrencyOpen] = useState(false)
    const [isOtherCurrencyOpen, setIsOtherCurrencyOpen] = useState(false)
    const [myCurrency, setMyCurrency] = useState(currency[0])
    const [otherCurrency, setOtherCurrency] = useState(currency[1])
    const [changeCurrencyCards, setChangeCurrencyCards] = useState(false)
    const [sendAmount, setSendAmount] = useState('1000')
    const [receiveAmount, setReceiveAmount] = useState('12 560 000')
    const [exchangeRate, setExchangeRate] = useState(null)
    const [isLoadingRate, setIsLoadingRate] = useState(false)
    const [feeCalculation, setFeeCalculation] = useState(null)

    // Fee configuration - default values (should be fetched from backend per country)
    const [transferFeePercentage, setTransferFeePercentage] = useState(10) // 10% transfer fee
    const [exchangeRateFeePercentage, setExchangeRateFeePercentage] = useState(2) // 2% exchange rate fee

    // Saved cards state
    const isLoggedIn = !!sessionStorage.getItem('token')
    const [myCards, setMyCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(null)
    const [isLoadingCards, setIsLoadingCards] = useState(false)
    const [isCardsExpanded, setIsCardsExpanded] = useState(false)

    // Crypto state
    const cryptoCurrencies = [
        { code: 'USDT', name: 'Tether USD', icon: '💵' },
        { code: 'BTC', name: 'Bitcoin', icon: '₿' },
        { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
        { code: 'USDC', name: 'USD Coin', icon: '💲' },
        { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
    ]

    const networkOptions = {
        USDT: [
            { code: 'TRC20', name: 'Tron (TRC20)', fee: 'Low fee' },
            { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
            { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
        ],
        BTC: [
            { code: 'BTC', name: 'Bitcoin Network', fee: 'Variable' }
        ],
        ETH: [
            { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
            { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
        ],
        USDC: [
            { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
            { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
        ],
        BNB: [
            { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
        ]
    }

    const [selectedCrypto, setSelectedCrypto] = useState(cryptoCurrencies[0])
    const [selectedNetwork, setSelectedNetwork] = useState(networkOptions['USDT'][0])
    const [walletAddress, setWalletAddress] = useState("")
    const [cryptoReceiverName, setCryptoReceiverName] = useState("")
    const [isCryptoOpen, setIsCryptoOpen] = useState(false)
    const [isNetworkOpen, setIsNetworkOpen] = useState(false)
    const [cryptoTermsChecked, setCryptoTermsChecked] = useState(false)

    // Update network options when crypto changes
    useEffect(() => {
        const networks = networkOptions[selectedCrypto.code]
        if (networks && networks.length > 0) {
            setSelectedNetwork(networks[0])
        }
    }, [selectedCrypto])

    // Validate wallet address format
    const validateWalletAddress = (address) => {
        if (!address) return false
        if (address.length < 26) return false
        if (selectedNetwork.code === 'TRC20' && !address.startsWith('T')) return false
        if ((selectedNetwork.code === 'ERC20' || selectedNetwork.code === 'BEP20') && !address.startsWith('0x')) return false
        if (selectedNetwork.code === 'BTC' && !address.match(/^(1|3|bc1)/)) return false
        return true
    }

    // Get transfer data from Home page
    useEffect(() => {
        if (location.state) {
            const {
                sendAmount: homeAmount,
                receiveAmount: homeReceive,
                fromCurrency,
                toCurrency,
                fromFlag,
                toFlag,
                paymentMethod,
                exchangeRate: homeRate,
                feeCalculation: homeFeeCalc,
                transferFeePercentage: homeTransferFee,
                exchangeRateFeePercentage: homeExchangeFee
            } = location.state

            if (homeAmount) setSendAmount(homeAmount)
            if (homeReceive) setReceiveAmount(homeReceive)
            if (fromCurrency && fromFlag) {
                setMyCurrency({ flag: fromFlag, currencyName: fromCurrency })
            }
            if (toCurrency && toFlag) {
                setOtherCurrency({ flag: toFlag, currencyName: toCurrency })
            }
            if (paymentMethod) {
                setMethod(paymentMethod)
            }
            if (homeRate) {
                setExchangeRate({ rate: homeRate })
            }
            if (homeFeeCalc) {
                setFeeCalculation(homeFeeCalc)
            }
            if (homeTransferFee !== undefined) {
                setTransferFeePercentage(homeTransferFee)
            }
            if (homeExchangeFee !== undefined) {
                setExchangeRateFeePercentage(homeExchangeFee)
            }
        }
    }, [location.state])

    // Fetch exchange rate when currencies change
    useEffect(() => {
        const fetchExchangeRate = async () => {
            if (myCurrency.currencyName === otherCurrency.currencyName) {
                setExchangeRate({ rate: 1 })
                return
            }

            try {
                setIsLoadingRate(true)
                const rateData = await getExchangeRate(myCurrency.currencyName, otherCurrency.currencyName)
                setExchangeRate(rateData)

                // Auto-calculate receive amount when rate is fetched
                if (sendAmount) {
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
    }, [myCurrency.currencyName, otherCurrency.currencyName])

    // Update receive amount when send amount changes - WITH FEE CALCULATION
    useEffect(() => {
        if (exchangeRate && sendAmount) {
            const amount = parseFloat(sendAmount.replace(/\s/g, ''))
            if (!isNaN(amount) && amount > 0) {
                // Calculate with fees
                const calculation = calculateTransactionFees(
                    amount,
                    transferFeePercentage,
                    exchangeRateFeePercentage,
                    exchangeRate.rate
                )
                setFeeCalculation(calculation)
                setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
            }
        }
    }, [sendAmount, exchangeRate, transferFeePercentage, exchangeRateFeePercentage])

    // Fetch saved cards when ANY payment method is selected (sender card is always needed)
    useEffect(() => {
        const fetchMyCards = async () => {
            if (isLoggedIn && curMethod) {
                try {
                    setIsLoadingCards(true)
                    const cards = await getUserCards()
                    console.log('Fetched cards:', cards)
                    setMyCards(cards || [])
                    // Don't auto-select - let user choose
                } catch (error) {
                    console.error('Failed to fetch cards:', error)
                    setMyCards([])
                } finally {
                    setIsLoadingCards(false)
                }
            }
        }
        fetchMyCards()
    }, [isLoggedIn, curMethod])


    return (
        <div className="currency">
            <div className="currency-body">
                <div className="currency-head">
                    <h2>
                        {t('specifyAmount')}
                    </h2>
                </div>
                <div className='currency-transfer-cont' style={{ flexDirection: !changeCurrencyCards ? "column" : "column-reverse" }}>
                    <div className='currency-transfer-top'>
                        <div className='currency-transfer-top-cash'>
                            <p>
                                {t("yousend")}
                            </p>
                            <input
                                type="text"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                            />
                        </div>
                        <div className="currDropdown">
                            <button
                                onClick={() => {
                                    setIsMyCurrencyOpen(!isMyCurrencyOpen)
                                }}
                                className="currToggle"
                            >
                                <img src={myCurrency.flag} alt="" className="currImg" />
                                <span className="currCode">{myCurrency?.currencyName.toUpperCase()}</span>
                                <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>

                            {isMyCurrencyOpen && (
                                <div className="currDropdownMenu">
                                    {currency.map((cur, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setMyCurrency(cur)
                                                setIsMyCurrencyOpen(false)
                                            }}
                                            className={`currOption ${myCurrency.currencyName === cur.currencyName ? 'active' : ''}`}
                                        >
                                            <img src={cur.flag} alt="" className="currImg" />
                                            <span>{cur.currencyName}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <button type='button' className='changeBtn' onClick={() => { setChangeCurrencyCards(!changeCurrencyCards) }}>
                        <ArrowUpDown/>
                    </button>
                    <div className='currency-transfer-bottom'>
                        <div className='currency-transfer-bottom-cash'>
                            <p>
                                {t("willtake")}
                            </p>
                            <input
                                type="text"
                                value={receiveAmount}
                                onChange={(e) => setReceiveAmount(e.target.value)}
                            />
                        </div>
                        <div className="currDropdown">
                            {/* Show crypto dropdown when crypto method is selected */}
                            {curMethod === t('methods.crypto') ? (
                                <>
                                    <button
                                        onClick={() => setIsCryptoOpen(!isCryptoOpen)}
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
                                            setIsOtherCurrencyOpen(!isOtherCurrencyOpen)
                                        }}
                                        className="currToggle"
                                    >
                                        <img src={otherCurrency.flag} alt="" className="currImg" />
                                        <span className="currCode">{otherCurrency?.currencyName.toUpperCase()}</span>
                                        <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                        </svg>
                                    </button>
                                    {isOtherCurrencyOpen && (
                                        <div className="currDropdownMenu">
                                            {currency.map((cur, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setOtherCurrency(cur)
                                                        setIsOtherCurrencyOpen(false)
                                                    }}
                                                    className={`currOption ${otherCurrency.currencyName === cur.currencyName ? 'active' : ''}`}
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
                <div className="currency-payMethod">
                    <h3>
                        {t('payMethod')}
                    </h3>
                </div>
                <div className="currency-bottom">
                    <div className="date-input-container" style={{ padding: "0" }}>
                        <button
                            onClick={() => setIsMethodOpen(!isMethodOpen)}
                            className="country-select-btn"
                        >
                            {
                                curMethod != "" ?
                                    <div className="currency-selected-method">
                                        <div className='methodIcon'>
                                            {curMethod === t('methods.debit') && (
                                                <img src={`/images/cardIcon${theme}.png`} alt="Card Icon" />
                                            )}
                                            {curMethod === t('methods.crypto') && (
                                                <img src={`/images/cryptoIcon${theme}.png`} alt="Crypto Icon" />
                                            )}
                                            {curMethod === t('methods.bank') && (
                                                <img src={`/images/bankIcon${theme}.png`} alt="Bank Icon" />
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
                                            <img src={`/images/cardIcon${theme}.png`} alt="Card Icon" />
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
                            <div className="country-dropdown-menu">
                                {methods.map((state, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleMethodSelect(state)}
                                        className={`country-option ${curMethod === state ? 'active' : ''}`}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span>{state}</span>
                                        {curMethod === state && (
                                            <img
                                                src={`/images/ruleDone${theme}.png`}
                                                alt="Selected"
                                                style={{ width: 18, height: 18 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sender Card Selection - shown for ALL payment methods when user is logged in */}
                {isLoggedIn && curMethod && (
                    <div className="saved-cards-accordion" style={{ margin: '1rem 0' }}>
                        {/* Section Header */}
                        <div className="currency-payMethod" style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                {t('senderCard') || 'Откуда списать средства'}
                            </h3>
                        </div>
                        {/* Accordion Header */}
                        <button
                            onClick={() => setIsCardsExpanded(!isCardsExpanded)}
                            className="country-select-btn"
                            style={{ width: '100%' }}
                        >
                            <div className="currency-selected-method">
                                <div className='methodIcon'>
                                    <CreditCard size={24} />
                                </div>
                                <div className='methodInfo'>
                                    <h3>
                                        {selectedCard
                                            ? `•••• •••• •••• ${(selectedCard.cardData?.cardNumber || selectedCard.cardNumber)?.slice(-4) || '****'}`
                                            : (t('selectCard') || 'Выберите карту')
                                        }
                                    </h3>
                                    <p>
                                        {selectedCard
                                            ? `${selectedCard.cardNetwork || selectedCard.cardData?.cardNetwork || selectedCard.brand || 'VISA'} ${selectedCard.bankName ? `• ${selectedCard.bankName}` : ''}`
                                            : (t('savedCardsDesc') || 'Карта для оплаты перевода')
                                        }
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                size={16}
                                style={{
                                    transform: isCardsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </button>

                        {/* Accordion Content */}
                        {isCardsExpanded && (
                            <div className="country-dropdown-menu" style={{ position: 'relative', marginTop: '0.5rem' }}>
                                {isLoadingCards ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>
                                        {t('loading') || 'Yuklanmoqda...'}
                                    </div>
                                ) : myCards.length > 0 ? (
                                    <>
                                        {myCards.map((card, index) => {
                                            const cardUniqueId = card.id || card.cardId || index
                                            const selectedUniqueId = selectedCard?.id || selectedCard?.cardId
                                            const isSelected = selectedCard && (selectedUniqueId === cardUniqueId)

                                            return (
                                                <button
                                                    key={cardUniqueId}
                                                    onClick={() => {
                                                        setSelectedCard(card)
                                                        setIsCardsExpanded(false)
                                                    }}
                                                    className={`country-option ${isSelected ? 'active' : ''}`}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.75rem 1rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <CreditCard size={18} style={{ opacity: 0.7 }} />
                                                        <div style={{ textAlign: 'left' }}>
                                                            <div style={{ fontWeight: 500 }}>
                                                                •••• {(card.cardData?.cardNumber || card.cardNumber)?.slice(-4) || '****'}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>
                                                                {card.cardNetwork || card.cardData?.cardNetwork || card.brand || 'VISA'} {card.bankName ? `• ${card.bankName}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            background: '#22c55e',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </>
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.6 }}>
                                        {t('noSavedCards') || 'Saqlangan kartalar yo\'q'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* Exchange Rate Display */}
                {exchangeRate && !isLoadingRate && (
                    <div className='currency-exchange-rate' style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                            {t("exchangeRate") || "Курс обмена"}
                        </p>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                            1 {myCurrency.currencyName} = {exchangeRate.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {curMethod === t('methods.crypto') ? selectedCrypto.code : otherCurrency.currencyName}
                        </h4>
                    </div>
                )}
                {isLoadingRate && (
                    <div className='currency-exchange-rate' style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.6 }}>
                            {t("loadingRate") || "Загрузка курса..."}
                        </p>
                    </div>
                )}

                <div className='currency-fee'>
                    <p>
                        {t("fee")} ({t("transferFee") || "Transfer"})
                    </p>
                    <h4>
                        {feeCalculation ? `${feeCalculation.transferFeePercentage}%` : `${transferFeePercentage}%`}
                    </h4>
                </div>
                <div className='currency-feeCount'>
                    <p>
                        {t("feeCount")}
                    </p>
                    <h4>
                        {feeCalculation ? `${feeCalculation.transferFeeAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${myCurrency.currencyName}` : `0 ${myCurrency.currencyName}`}
                    </h4>
                </div>
                {feeCalculation && feeCalculation.exchangeRateFeePercentage > 0 && (
                    <div className='currency-fee' style={{ marginTop: '0.25rem' }}>
                        <p>
                            {t("exchangeRateFee") || "Exchange Rate Fee"}
                        </p>
                        <h4>
                            {feeCalculation.exchangeRateFeePercentage}%
                        </h4>
                    </div>
                )}

{/* Warning if no sender card selected */}
                {isLoggedIn && curMethod && !selectedCard && myCards.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        backgroundColor: theme === 'dark' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.08)',
                        border: '1px solid rgba(234, 179, 8, 0.25)'
                    }}>
                        <AlertCircle size={18} style={{ color: '#eab308', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
                            {t("selectSenderCardWarning") || "Выберите карту, с которой будет списана оплата"}
                        </p>
                    </div>
                )}

                {/* Warning if no cards available */}
                {isLoggedIn && curMethod && myCards.length === 0 && !isLoadingCards && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)'
                    }}>
                        <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
                            {t("noCardsWarning") || "У вас нет сохраненных карт. Добавьте карту в профиле."}
                        </p>
                    </div>
                )}

                <button
                    className="currency-continueBtn"
                    disabled={!curMethod || (isLoggedIn && !selectedCard)}
                    style={{
                        opacity: (!curMethod || (isLoggedIn && !selectedCard)) ? 0.5 : 1
                    }}
                    onClick={() => {
                        // Build sender card data
                        const senderCardData = selectedCard ? {
                            cardId: selectedCard.id || selectedCard.cardId,
                            cardNumber: (selectedCard.cardData?.cardNumber || selectedCard.cardNumber),
                            cardNetwork: (selectedCard.cardNetwork || selectedCard.cardData?.cardNetwork || selectedCard.brand || 'VISA'),
                            cardHolderName: (selectedCard.cardData?.cardHolderName || selectedCard.cardHolderName),
                            expiryMonth: (selectedCard.cardData?.expiryMonth || selectedCard.expiryMonth),
                            expiryYear: (selectedCard.cardData?.expiryYear || selectedCard.expiryYear),
                            bankName: selectedCard.bankName
                        } : null

                        // Build transfer data to pass to next page
                        const transferData = {
                            sendAmount,
                            receiveAmount,
                            fromCurrency: myCurrency.currencyName,
                            toCurrency: curMethod === t('methods.crypto') ? selectedCrypto.code : otherCurrency.currencyName,
                            fromFlag: myCurrency.flag,
                            toFlag: otherCurrency.flag,
                            paymentMethod: curMethod,
                            exchangeRate: exchangeRate?.rate || null,
                            feeCalculation: feeCalculation || null,
                            transferFeePercentage,
                            exchangeRateFeePercentage,
                            // Sender card - the card from which payment will be taken
                            senderCard: senderCardData
                        }

                        if (curMethod === t('methods.debit')) {
                            // Go to cardnumber page to enter RECEIVER's card details
                            navigate('/cardnumber', { state: transferData })
                        } else if (curMethod === t('methods.crypto')) {
                            // Go to cardnumber page to enter wallet and receiver info
                            navigate('/cardnumber', {
                                state: {
                                    ...transferData,
                                    paymentMethod: 'CRYPTO',
                                    cryptoCurrency: selectedCrypto.code,
                                    cryptoIcon: selectedCrypto.icon,
                                    cryptoName: selectedCrypto.name
                                }
                            })
                        } else if (curMethod === t('methods.bank')) {
                            navigate('/bank-transfer', { state: transferData })
                        } else {
                            // If no method selected, open the dropdown to prompt selection
                            setIsMethodOpen(true)
                        }
                    }}
                >
                    {t('reg-clientStep1')}
                </button>
            </div>
        </div>
    )
}

export default UnRegCur