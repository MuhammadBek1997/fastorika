import React, { useState } from 'react'
import { useGlobalContext } from '../Context'
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "Как отправить деньги?",
      answer: "Pul o'tkazmasini amalga oshirish uchun ilovaga kiring, 'Pul yuborish' bo'limini tanlang, qabul qiluvchining ma'lumotlarini kiriting (telefon raqami yoki karta raqami), summani ko'rsating va to'lovni tasdiqlang."
    },
    {
      question: "Какая комиссия взимается за перевод?",
      answer: "Komissiya summasi o'tkazma turiga va miqdoriga bog'liq. Ichki o'tkazmalar uchun 0.5% dan 2% gacha, xalqaro o'tkazmalar uchun esa 2% dan 5% gacha komissiya olinadi. Aniq summani o'tkazma yuborishdan oldin ko'rishingiz mumkin."
    },
    {
      question: "Сколько денег получит адресат?",
      answer: "Qabul qiluvchi siz yuborgan summadan komissiya miqdorini ayirib tashlangandan keyingi summani oladi. Agar siz to'liq summani yubormoqchi bo'lsangiz, komissiyani o'zingiz to'lash variantini tanlashingiz mumkin."
    },
    {
      question: "Сколько времени занимает перевод?",
      answer: "O'tkazma tezligi yo'nalishga bog'liq. Bir bank ichidagi o'tkazmalar bir necha daqiqada, boshqa banklarga 10 daqiqadan 24 soatgacha, xalqaro o'tkazmalar esa 1-5 ish kuni ichida bajariladi."
    },
    {
      question: "Какие лимиты установлены на переводы?",
      answer: "Kunlik limit tasdiqlangan foydalanuvchilar uchun 50 million so'mgacha, oylik limit esa 200 million so'mgacha. Tasdiqlanmagan hisoblar uchun limitlar ancha pastroq bo'ladi. Xalqaro o'tkazmalar uchun alohida limitlar amal qiladi."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
                <input type="text" value="1000" />
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
  )
}

export default Home