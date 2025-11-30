import { useState } from "react"
import './currency.css'
import { useNavigate } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronRight } from "lucide-react"


const UnRegCur = () => {

    let { t, theme } = useGlobalContext()
    const navigate = useNavigate()

    let currency = [
        {
            flag: 'https://img.icons8.com/color/96/usa-circular.png',
            currencyName: 'USD'
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
    const [otherCurrency, setOtherCurrency] = useState(currency[0])
    const [changeCurrencyCards, setChangeCurrencyCards] = useState(false)


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
                <input type="text" defaultValue="1000" />
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
                        <img src={`/images/changeBtn${theme}.png`} alt="" />
                    </button>
                    <div className='currency-transfer-bottom'>
                        <div className='currency-transfer-bottom-cash'>
                            <p>
                                {t("willtake")}
                            </p>
                <input type="text" defaultValue={"12 560 000"} />
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
                <div className='currency-fee'>
                    <p>
                        {t("fee")}
                    </p>
                    <h4>
                        0.5%
                    </h4>
                </div>
                <div className='currency-feeCount'>
                    <p>
                        {t("feeCount")}
                    </p>
                    <h4>
                        1005 USD
                    </h4>
                </div>
                <button
                    className="currency-continueBtn"
                    onClick={() => {
                        if (curMethod === t('methods.debit')) {
                            navigate('/cardnumber')
                        } else if (curMethod === t('methods.crypto')) {
                            navigate('/crypto')
                        } else if (curMethod === t('methods.bank')) {
                            navigate('/provider')
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