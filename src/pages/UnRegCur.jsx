import { useState, useEffect, useRef } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ArrowUpDown, ChevronRight, CreditCard, Bitcoin, BanknoteArrowUp, Info, X } from "lucide-react"
import { getRatePair, calculateTransactionFees } from "../api"
import VerificationModal from "../components/VerificationModal"
import CancelTransactionModal from "../components/CancelTransactionModal"


const UnRegCur = () => {

    let { t, transferData, updateTransferData } = useGlobalContext()
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
    const [curMethod, setMethod] = useState(transferData?.paymentMethod || "")
    const [isMyCurrencyOpen, setIsMyCurrencyOpen] = useState(false)
    const [isOtherCurrencyOpen, setIsOtherCurrencyOpen] = useState(false)
    const [myCurrency, setMyCurrency] = useState(() => {
        if (transferData?.fromCurrency) {
            const found = currency.find(c => c.currencyName === transferData.fromCurrency)
            return found || currency[0]
        }
        return currency[0]
    })
    const [otherCurrency, setOtherCurrency] = useState(() => {
        if (transferData?.toCurrency) {
            const found = currency.find(c => c.currencyName === transferData.toCurrency)
            return found || currency[1]
        }
        return currency[1]
    })
        const [sendAmount, setSendAmount] = useState(transferData?.sendAmount || '0')
    const [receiveAmount, setReceiveAmount] = useState(transferData?.receiveAmount || '0')
    const [exchangeRate, setExchangeRate] = useState(null)
    const [feeCalculation, setFeeCalculation] = useState(null)

    // Fee configuration - default values (should be fetched from backend per country)
    const [transferFeePercentage, setTransferFeePercentage] = useState(10) // 10% transfer fee
    const [exchangeRateFeePercentage, setExchangeRateFeePercentage] = useState(2) // 2% exchange rate fee

    // Auth state
    const isLoggedIn = !!sessionStorage.getItem('token')
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
    const isSwapping = useRef(false)
    const editingField = useRef(null) // 'send' or 'receive' — tracks which input the user is typing in

    // Crypto state
    const cryptoCurrencies = [
        { code: 'USDT', name: 'Tether USD', icon: '💵' },
        { code: 'BTC', name: 'Bitcoin', icon: '₿' },
        { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
        { code: 'USDC', name: 'USD Coin', icon: '💲' },
        { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
    ]

    const [selectedSendCrypto, setSelectedSendCrypto] = useState(cryptoCurrencies[1]) // BTC — jo'natish uchun
    const [isSendCryptoOpen, setIsSendCryptoOpen] = useState(false)

    // Modal states
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    // Function to proceed with transfer after verification check
    const proceedWithTransfer = () => {
        // Build transfer data and save to global context
        // Note: Sender card is not collected here - user enters it on payment system (Volet)
        const isCryptoMethod = curMethod === t('methods.crypto')
        const newTransferData = {
            sendAmount,
            receiveAmount,
            fromCurrency: isCryptoMethod ? selectedSendCrypto.code : myCurrency.currencyName,
            toCurrency: otherCurrency.currencyName,
            fromFlag: isCryptoMethod ? null : myCurrency.flag,
            toFlag: otherCurrency.flag,
            paymentMethod: curMethod,
            exchangeRate: exchangeRate?.rate || null,
            feeCalculation: feeCalculation || null,
            transferFeePercentage,
            exchangeRateFeePercentage,
            step1Completed: true
        }

        // Add crypto data if crypto method selected
        if (isCryptoMethod) {
            newTransferData.sendCryptoCurrency = selectedSendCrypto.code
            newTransferData.sendCryptoIcon = selectedSendCrypto.icon
            newTransferData.sendCryptoName = selectedSendCrypto.name
        }

        // Save to global context
        updateTransferData(newTransferData)

        // Persist key values to sessionStorage as fallback (survives page refresh)
        sessionStorage.setItem('transfer_sendAmount', String(sendAmount))
        sessionStorage.setItem('transfer_fromCurrency', isCryptoMethod ? selectedSendCrypto.code : myCurrency.currencyName)

        if (curMethod === t('methods.debit')) {
            navigate('/cardnumber')
        } else if (curMethod === t('methods.crypto')) {
            navigate('/cardnumber')
        } else if (curMethod === t('methods.bank')) {
            navigate('/bank-transfer')
        } else {
            setIsMethodOpen(true)
        }
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
                const rateData = await getRatePair(
                    myCurrency.currencyName,
                    otherCurrency.currencyName,
                    otherCurrency.currencyName
                )
                setExchangeRate({ rate: rateData.rate, lastUpdatedAt: rateData.lastUpdatedAt })

                // Update fee percentages from backend
                if (rateData.feePercentages) {
                    setTransferFeePercentage(rateData.feePercentages.transferFeePercentage ?? 0)
                    setExchangeRateFeePercentage(rateData.feePercentages.exchangeRateFeePercentage ?? 0)
                }

                // Auto-calculate receive amount when rate is fetched (skip during swap)
                if (sendAmount && !isSwapping.current) {
                    const amount = parseFloat(sendAmount.replace(/\s/g, ''))
                    if (!isNaN(amount)) {
                        const tFee = rateData.feePercentages?.transferFeePercentage ?? transferFeePercentage
                        const eFee = rateData.feePercentages?.exchangeRateFeePercentage ?? exchangeRateFeePercentage
                        const calculation = calculateTransactionFees(amount, tFee, eFee, rateData.rate)
                        setFeeCalculation(calculation)
                        setReceiveAmount(calculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 }))
                    }
                }
            } catch (error) {
                console.error('Failed to fetch exchange rate:', error)
                setExchangeRate(null)
            } finally {
            }
        }

        fetchExchangeRate()
    }, [myCurrency.currencyName, otherCurrency.currencyName])

    // Update receive amount when send amount changes - WITH FEE CALCULATION
    useEffect(() => {
        if (isSwapping.current) return
        if (editingField.current === 'receive') return // Skip when user is editing receive field
        if (exchangeRate && sendAmount) {
            const amount = parseFloat(sendAmount.replace(/\s/g, ''))
            if (!isNaN(amount) && amount > 0) {
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

    // Reverse: update send amount when receive amount changes (user editing receive field)
    useEffect(() => {
        if (isSwapping.current) return
        if (editingField.current !== 'receive') return
        if (exchangeRate && receiveAmount) {
            const received = parseFloat(receiveAmount.replace(/[,\s]/g, ''))
            if (!isNaN(received) && received > 0) {
                // Reverse formula: amountReceived = amountSent * (1 - transferFee/100) * adjustedRate
                // adjustedRate = baseRate * (1 - exchangeRateFee/100)
                const adjustedRate = exchangeRate.rate * (1 - (exchangeRateFeePercentage || 0) / 100)
                const transferMultiplier = 1 - (transferFeePercentage || 0) / 100
                if (adjustedRate > 0 && transferMultiplier > 0) {
                    const computedSend = received / (adjustedRate * transferMultiplier)
                    const rounded = Math.round(computedSend * 100) / 100
                    setSendAmount(rounded.toString())
                    // Update fee calculation based on computed send amount
                    const calculation = calculateTransactionFees(
                        rounded,
                        transferFeePercentage,
                        exchangeRateFeePercentage,
                        exchangeRate.rate
                    )
                    setFeeCalculation(calculation)
                }
            }
        }
    }, [receiveAmount, exchangeRate, transferFeePercentage, exchangeRateFeePercentage])



    return (
        <>
        <div className="currency">
            <div className="currency-body">
                <div className="currency-head">
                    <h2>
                        {t('specifyAmount')}
                    </h2>
                </div>
                <div className='currency-transfer-cont'>
                    <div className='currency-transfer-top'>
                        <div className='currency-transfer-top-cash'>
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
                        <div className="currDropdown">
                            {curMethod === t('methods.crypto') ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsSendCryptoOpen(!isSendCryptoOpen)
                                            setIsMyCurrencyOpen(false)
                                            setIsOtherCurrencyOpen(false)


                                            setIsMethodOpen(false)
                                        }}
                                        className="currToggle"
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{selectedSendCrypto.icon}</span>
                                        <span className="currCode">{selectedSendCrypto.code}</span>
                                        <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                        </svg>
                                    </button>
                                    {isSendCryptoOpen && (
                                        <div className="currDropdownMenu">
                                            {cryptoCurrencies.map((crypto) => (
                                                <button
                                                    key={crypto.code}
                                                    onClick={() => {
                                                        setSelectedSendCrypto(crypto)
                                                        setIsSendCryptoOpen(false)
                                                    }}
                                                    className={`currOption ${selectedSendCrypto.code === crypto.code ? 'active' : ''}`}
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
                                            setIsMyCurrencyOpen(!isMyCurrencyOpen)
                                            setIsOtherCurrencyOpen(false)


                                            setIsMethodOpen(false)
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
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        type='button'
                        className='changeBtn'
                        disabled={curMethod === t('methods.crypto')}
                        style={{
                            opacity: curMethod === t('methods.crypto') ? 0.35 : 1,
                            cursor: curMethod === t('methods.crypto') ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => {
                            if (curMethod === t('methods.crypto')) return
                            isSwapping.current = true
                            const tempAmount = sendAmount
                            setSendAmount(receiveAmount.replace(/,/g, ''))
                            setReceiveAmount(tempAmount)
                            const tempCur = myCurrency
                            setMyCurrency(otherCurrency)
                            setOtherCurrency(tempCur)
                            setTimeout(() => { isSwapping.current = false; editingField.current = null }, 100)
                        }}
                    >
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
                        <div className="currDropdown">
                            {/* Always show fiat dropdown on receiver side */}
                            <>
                                    <button
                                        onClick={() => {
                                            setIsOtherCurrencyOpen(!isOtherCurrencyOpen)
                                            setIsMyCurrencyOpen(false)
                                            setIsSendCryptoOpen(false)
                                            setIsMethodOpen(false)
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
                        </div>
                    </div>
                </div>
                {/* Exchange rate row with Info button */}
                {exchangeRate && myCurrency.currencyName !== otherCurrency.currencyName && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        marginTop: '0',
                        borderRadius: '0.75rem',
                        }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            1 {myCurrency.currencyName} = {(feeCalculation?.adjustedExchangeRate || (exchangeRate.rate * (1 - exchangeRateFeePercentage / 100))).toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCurrency.currencyName}
                        </span>
                        <span
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', opacity: 0.7 }}
                            title={t("feeDetails") || "Fee details"}
                            onClick={() => setIsFeeModalOpen(true)}
                        >
                            <Info size={16} />
                        </span>
                    </div>
                )}
                <div className="currency-payMethod">
                    <h3>
                        {t('payMethod')}
                    </h3>
                </div>
                <div className="currency-bottom">
                    <div className="date-input-container" style={{ padding: "0" }}>
                        <button
                            onClick={() => {
                                setIsMethodOpen(!isMethodOpen)
                                setIsMyCurrencyOpen(false)
                                setIsOtherCurrencyOpen(false)
                                setIsSendCryptoOpen(false)
                            }}
                            className="country-select-btn"
                        >
                            {
                                curMethod != "" ?
                                    <div className="currency-selected-method">
                                        <div className='methodIcon'>
                                            {curMethod === t('methods.debit') && (
                                                <CreditCard/>
                                            )}
                                            {curMethod === t('methods.crypto') && (
                                                <Bitcoin/>
                                            )}
                                            {curMethod === t('methods.bank') && (
                                                <BanknoteArrowUp/>
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
                                            <CreditCard />
                                        </div>
                                        <div className='methodInfo'>
                                            <h3>
                                                {t("selectPayMethod") || "Выберите способ оплаты"}
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
                            <div className="method-dropdown-menu">
                                {methods.map((state, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleMethodSelect(state)}
                                        className={`method-option ${curMethod === state ? 'active' : ''}`}
                                    >
                                        <div className="method-option-left">
                                            <div className="method-option-icon">
                                                {state === t('methods.debit') && <CreditCard size={18} />}
                                                {state === t('methods.crypto') && <Bitcoin size={18} />}
                                                {state === t('methods.bank') && <BanknoteArrowUp size={18} />}
                                            </div>
                                            <span>{state}</span>
                                        </div>
                                        {curMethod === state && (
                                            <div className="method-option-check">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                


                <button
                    className="currency-continueBtn"
                    disabled={!curMethod || !sendAmount || parseFloat(sendAmount) <= 0}
                    style={{
                        opacity: (!curMethod || !sendAmount || parseFloat(sendAmount) <= 0) ? 0.5 : 1
                    }}
                    onClick={() => {
                        proceedWithTransfer()
                    }}
                >
                    {t('reg-clientStep1')}
                </button>

                {/* Verification Modal */}
                <VerificationModal
                    isOpen={showVerificationModal}
                    isLoggedIn={isLoggedIn}
                    onClose={() => {
                        setShowVerificationModal(false)
                        setShowCancelModal(true)
                    }}
                    onConfirm={() => {
                        setShowVerificationModal(false)
                        // If not logged in, redirect to registration, otherwise to KYC
                        if (!isLoggedIn) {
                            navigate('/registration')
                        } else {
                            navigate('/kyc')
                        }
                    }}
                />

                {/* Cancel Transaction Modal */}
                <CancelTransactionModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={() => {
                        setShowCancelModal(false)
                        navigate('/')
                    }}
                />
            </div>
        </div>

        {/* Fee Details Modal — at root level so position:fixed works correctly */}
        {isFeeModalOpen && (
            <div className="fee-modal-overlay" onClick={() => setIsFeeModalOpen(false)}>
                <div className="fee-modal" onClick={(e) => e.stopPropagation()}>

                    <button className="fee-modal-close" onClick={() => setIsFeeModalOpen(false)}>
                        <X size={20} />
                    </button>

                    <div className="fee-modal-header">
                        <h3>{t("exchangeRate") || "Курс обмена"}</h3>
                    </div>

                    <div className="fee-modal-body">
                        {/* Base rate */}
                        <div className="fee-modal-row">
                            <span className="fee-label">{t("baseRate") || "Рыночный курс"}</span>
                            <span className="fee-value">
                                1 {myCurrency.currencyName} = {exchangeRate?.rate?.toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCurrency.currencyName}
                            </span>
                        </div>

                        {/* Commissions section */}
                        {(transferFeePercentage > 0 || exchangeRateFeePercentage > 0) && (
                            <>
                                <div className="fee-modal-section-title">
                                    <span>{t("commissionsTitle") || "Комиссии"}</span>
                                </div>

                                {transferFeePercentage > 0 && (
                                    <div className="fee-modal-row">
                                        <span className="fee-label">{t("fee")} ({t("transferFee") || "Перевод"})</span>
                                        <span className="fee-value negative">-{transferFeePercentage}%</span>
                                    </div>
                                )}

                                {feeCalculation && transferFeePercentage > 0 && (
                                    <div className="fee-modal-row fee-modal-row-indent">
                                        <span className="fee-label">{t("feeCount") || "Сумма комиссии"}</span>
                                        <span className="fee-value negative">
                                            -{feeCalculation.transferFeeAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {myCurrency.currencyName}
                                        </span>
                                    </div>
                                )}

                                {exchangeRateFeePercentage > 0 && (
                                    <div className="fee-modal-row">
                                        <span className="fee-label">{t("exchangeRateFee") || "Комиссия по курсу"}</span>
                                        <span className="fee-value negative">-{exchangeRateFeePercentage}%</span>
                                    </div>
                                )}
                            </>
                        )}

                        <hr className="fee-modal-divider" />

                        {/* Your rate after fees */}
                        <div className="fee-modal-result">
                            <span className="fee-label">{t("yourRate") || "Ваш курс"}</span>
                            <span className="fee-value">
                                1 {myCurrency.currencyName} = {(feeCalculation?.adjustedExchangeRate || (exchangeRate?.rate * (1 - exchangeRateFeePercentage / 100))).toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCurrency.currencyName}
                            </span>
                        </div>

                        {/* Recipient receives */}
                        {feeCalculation && (
                            <div className="fee-modal-received">
                                <span className="fee-modal-received-label">
                                    {t("recipientReceives") || "Получатель получит"}
                                </span>
                                <span className="fee-modal-received-amount">
                                    {feeCalculation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 })} {otherCurrency.currencyName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default UnRegCur