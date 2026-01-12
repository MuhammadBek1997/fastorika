import { useState, useEffect } from "react"
import './currency.css'
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ArrowUpDown, ChevronRight } from "lucide-react"
import { getExchangeRate, calculateTransactionFees } from "../api"


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
                            1 {myCurrency.currencyName} = {exchangeRate.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} {otherCurrency.currencyName}
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
                <button
                    className="currency-continueBtn"
                    onClick={() => {
                        // Build transfer data to pass to next page
                        const transferData = {
                            sendAmount,
                            receiveAmount,
                            fromCurrency: myCurrency.currencyName,
                            toCurrency: otherCurrency.currencyName,
                            fromFlag: myCurrency.flag,
                            toFlag: otherCurrency.flag,
                            paymentMethod: curMethod,
                            exchangeRate: exchangeRate?.rate || null,
                            feeCalculation: feeCalculation || null,
                            transferFeePercentage,
                            exchangeRateFeePercentage
                        }

                        if (curMethod === t('methods.debit')) {
                            navigate('/cardnumber', { state: transferData })
                        } else if (curMethod === t('methods.crypto')) {
                            navigate('/crypto', { state: transferData })
                        } else if (curMethod === t('methods.bank')) {
                            navigate('/provider', { state: transferData })
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