import { useState, useEffect, useRef } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ArrowUpDown, ChevronRight, ChevronDown, CreditCard, Bitcoin, BanknoteArrowUp } from "lucide-react"
import { getExchangeRate, calculateTransactionFees } from "../api"
import VerificationModal from "../components/VerificationModal"
import CancelTransactionModal from "../components/CancelTransactionModal"


const UnRegCur = () => {

    let { t, theme, transferData, updateTransferData, kycStatus } = useGlobalContext()
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
    const [selMeth, setSelMeth] = useState({})
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
    const [isLoadingRate, setIsLoadingRate] = useState(false)
    const [feeCalculation, setFeeCalculation] = useState(null)

    // Fee configuration - default values (should be fetched from backend per country)
    const [transferFeePercentage, setTransferFeePercentage] = useState(10) // 10% transfer fee
    const [exchangeRateFeePercentage, setExchangeRateFeePercentage] = useState(2) // 2% exchange rate fee

    // Auth state
    const isLoggedIn = !!sessionStorage.getItem('token')
    const [isFeeExpanded, setIsFeeExpanded] = useState(false)
    const isSwapping = useRef(false)

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

    // Modal states
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    // Update network options when crypto changes
    useEffect(() => {
        const networks = networkOptions[selectedCrypto.code]
        if (networks && networks.length > 0) {
            setSelectedNetwork(networks[0])
        }
    }, [selectedCrypto])

    // Function to proceed with transfer after verification check
    const proceedWithTransfer = () => {
        // Build transfer data and save to global context
        // Note: Sender card is not collected here - user enters it on payment system (Volet)
        const newTransferData = {
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
            step1Completed: true
        }

        // Add crypto data if crypto method selected
        if (curMethod === t('methods.crypto')) {
            newTransferData.cryptoCurrency = selectedCrypto.code
            newTransferData.cryptoIcon = selectedCrypto.icon
            newTransferData.cryptoName = selectedCrypto.name
        }

        // Save to global context
        updateTransferData(newTransferData)

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
    }, [myCurrency.currencyName, otherCurrency.currencyName])

    // Update receive amount when send amount changes - WITH FEE CALCULATION
    useEffect(() => {
        if (isSwapping.current) return // Skip recalculation during swap
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



    return (
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
                                    let val = e.target.value
                                    // Remove non-numeric characters except decimal point
                                    val = val.replace(/[^0-9.]/g, '')
                                    // Remove leading zeros (but keep "0." for decimals)
                                    val = val.replace(/^0+(?=\d)/, '')
                                    // Only allow one decimal point
                                    const parts = val.split('.')
                                    if (parts.length > 2) {
                                        val = parts[0] + '.' + parts.slice(1).join('')
                                    }
                                    // Limit decimal places to 2
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
                                    setIsMyCurrencyOpen(!isMyCurrencyOpen)
                                    // Boshqa dropdownlarni yopish
                                    setIsOtherCurrencyOpen(false)
                                    setIsCryptoOpen(false)
                                    setIsNetworkOpen(false)
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
                        </div>
                    </div>
                    <button type='button' className='changeBtn' onClick={() => {
                        isSwapping.current = true
                        // Swap amounts
                        const tempAmount = sendAmount
                        setSendAmount(receiveAmount.replace(/,/g, ''))
                        setReceiveAmount(tempAmount)
                        // Swap currencies
                        const tempCur = myCurrency
                        setMyCurrency(otherCurrency)
                        setOtherCurrency(tempCur)
                        // Reset flag after state updates
                        setTimeout(() => { isSwapping.current = false }, 100)
                    }}>
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
                                            setIsMyCurrencyOpen(false)
                                            setIsOtherCurrencyOpen(false)
                                            setIsNetworkOpen(false)
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
                                            setIsOtherCurrencyOpen(!isOtherCurrencyOpen)
                                            // Boshqa dropdownlarni yopish
                                            setIsMyCurrencyOpen(false)
                                            setIsCryptoOpen(false)
                                            setIsNetworkOpen(false)
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
                            onClick={() => {
                                setIsMethodOpen(!isMethodOpen)
                                // Boshqa dropdownlarni yopish
                                setIsMyCurrencyOpen(false)
                                setIsOtherCurrencyOpen(false)
                                setIsCryptoOpen(false)
                                setIsNetworkOpen(false)
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

                {/* Fee Accordion */}
                <div className="fee-accordion" style={{ marginTop: '1rem' }}>
                    <button
                        onClick={() => setIsFeeExpanded(!isFeeExpanded)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '0.5rem',
                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }}
                    >
                        
                        <ChevronDown
                            size={20}
                            style={{
                                transform: isFeeExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                opacity: 0.6
                            }}
                        />
                    </button>

                    {isFeeExpanded && (
                        <div style={{ padding: '0.5rem 0' }}>
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
                        </div>
                    )}
                </div>


                <button
                    className="currency-continueBtn"
                    disabled={!curMethod}
                    style={{
                        opacity: !curMethod ? 0.5 : 1
                    }}
                    onClick={() => {
                        // Check if user is not logged in - show verification modal
                        if (!isLoggedIn) {
                            setShowVerificationModal(true)
                            return
                        }

                        // Check if user is logged in but not verified
                        if (isLoggedIn && kycStatus !== 'VERIFIED') {
                            setShowVerificationModal(true)
                            return
                        }

                        // Proceed with transfer (only for verified users)
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
    )
}

export default UnRegCur