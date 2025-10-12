import React, { useState } from 'react'
import { useGlobalContext } from '../Context'

const Home = () => {

  let { t, theme } = useGlobalContext()

  let currency = [
    {
      flag: '/images/us.png',
      currencyName: 'USD'
    }
  ]


  const [isMyCurOpen, setIsMyCurOpen] = useState(false)
  const [isOtheCurOpen, setIsOtheCurOpen] = useState(false)
  const [myCur, setMyCur] = useState(currency[0])
  const [otherCur, setOtherCur] = useState(currency[0])
  const [changeCards, setChangeCards] = useState(false)

  return (
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
          <div className='hero-transfer-cont' style={{ flexDirection: !changeCards ? "column" : "column-reverse" }}>
            <div className='hero-transfer-top'>
              <div className='hero-transfer-top-cash'>
                <p>
                  {t("yousend")}
                </p>
                <input type="text" value={"1000"} />
              </div>
              <div className="currDropdown">
                <button
                  onClick={() => {
                    setIsMyCurOpen(!isMyCurOpen)
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
            <button type='button' className='changeBtn' onClick={() => { setChangeCards(!changeCards) }}>
              <img src={`/images/changeBtn${theme}.png`} alt="" />
            </button>
            <div className='hero-transfer-bottom'>
              <div className='hero-transfer-bottom-cash'>
                <p>
                  {t("willtake")}
                </p>
                <input type="text" value={"12 560 000"} />
              </div>
              <div className="currDropdown">
                <button
                  onClick={() => {
                    setIsOtheCurOpen(!isOtheCurOpen)
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
              </div>
            </div>
          </div>
          <div className="hero-right-cardInfo">
            <h3>
              {t("payMethod")}
            </h3>
            <div className='cardInfo-cont'>
              <div className='cardInfoIcon'>
                <img src={`/images/cardIcon${theme}.png`} alt="Card Icon" />
              </div>
              <div className='cardInfo-numbers'>
                <h3>
                  {t("noCard")}
                </h3>
                <p>
                  Visa, Mastercard, Maestro…
                </p>
              </div>
              <svg className="ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </div>
          </div>
          <div className='hero-right-transferBtn'>
            <div className='hero-fee'>
              <p>
                {t("fee")}
              </p>
              <h4>
                0.5%
              </h4>
            </div>
            <div className='hero-feeCount'>
              <p>
                {t("feeCount")}
              </p>
              <h4>
                1005 USD
              </h4>
            </div>
            <button>
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
    </section>
  )
}

export default Home