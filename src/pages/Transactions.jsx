import React, { useState } from 'react'
import { useGlobalContext } from '../Context'

const Transactions = () => {
  let {t,theme} = useGlobalContext()
  let currency = [
    {
      flag: '/images/us.png',
      currencyName: 'USD'
    }
  ]
  const [isMyTransCurOpen, setIsMyTransCurOpen] = useState(false)
  const [isOtheTransCurOpen, setIsOtheTransCurOpen] = useState(false)
  const [myTransCur, setMyTransCur] = useState(currency[0])
  const [otherTransCur, setOtherTransCur] = useState(currency[0])
  const [changeTransCards, setChangeTransCards] = useState(false)
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className='transactions' id='webSection'>
      <div className="transactions-navbar">
        <div className={`transactions-transfer-cont ${!changeTransCards ? "transrow" : "transreverse"}`}>
            <div className='transactions-transfer-top'>
              <div className='transactions-transfer-top-cash'>
                <p>
                  {t("yousend")}
                </p>
                <input type="text" value="1000" />
              </div>
              <div className="currTransDropdown">
                <button
                  onClick={() => {
                    setIsMyTransCurOpen(!isMyTransCurOpen)
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
              <img src={`/images/changeBtn${theme}.png`} alt="" />
            </button>
            <div className='transactions-transfer-bottom'>
              <div className='transactions-transfer-bottom-cash'>
                <p>
                  {t("willtake")}
                </p>
                <input type="text" value={"12 560 000"} />
              </div>
              <div className="currTransDropdown">
                <button
                  onClick={() => {
                    setIsOtheTransCurOpen(!isOtheTransCurOpen)
                  }}
                  className="currTransToggle"

                >
                  <img src={otherTransCur.flag} alt="" className="currImg" />
                  <span className="currCode">{otherTransCur?.currencyName.toUpperCase()}</span>
                  <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>

                {isOtheTransCurOpen && (
                  <div className="currTransDropdownMenu">
                    {currency.map((cur, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsOtheTransCurOpen(false)
                        }}
                        className={`currOption ${otherTransCur.currencyName === cur.currencyName ? 'active' : ''}`}
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
        <button className='transactions-transferBtn'>
            {t("transBtn")}
        </button>
      </div>
      <div className="transaction-body">

      </div>
    </div>
  )
}

export default Transactions