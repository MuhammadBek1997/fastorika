import React, { useState } from 'react'
import './transactions.css'
import { useGlobalContext } from '../Context'
import { Check, Clock, List, MessagesSquare, MinusCircle } from 'lucide-react'

const Transactions = () => {
  let { t, theme, navigate, transactions } = useGlobalContext()
  // Safe fallbacks for translations that were reported missing in list rows
  const translateStatus = (statusKey) => {
    const k = `transactions.status.${statusKey}`
    const v = t(k)
    return v === k ? t(`transactionInfo.status.${statusKey}`) : v
  }
  const toCardPrimary = t('transactions.toCard')
  const toCardResolved = toCardPrimary === 'transactions.toCard' ? t('global.toCard') : toCardPrimary
  let currency = [
    {
      flag: 'https://img.icons8.com/color/96/usa-circular.png',
      currencyName: 'USD'
    }
  ]
  const [isMyTransCurOpen, setIsMyTransCurOpen] = useState(false)
  const [isOtheTransCurOpen, setIsOtheTransCurOpen] = useState(false)
  const [myTransCur, setMyTransCur] = useState(currency[0])
  const [otherTransCur, setOtherTransCur] = useState(currency[0])
  const [changeTransCards, setChangeTransCards] = useState(false)
  const [openIndex, setOpenIndex] = useState(null);
  const [regoffer, setRegoffer] = useState(localStorage.getItem("regoffer") || "show")





  const handleRegoffer = () => {
    localStorage.setItem("regoffer", "hide");
    setRegoffer("hide")
  }

  return (
    <div className='transactions' id='webSection'>
      <div className="transactions-navbar">
        <div className={`transactions-transfer-cont ${!changeTransCards ? "transrow" : "transreverse"}`}>
          <div className='transactions-transfer-top'>
            <div className='transactions-transfer-top-cash'>
              <p>
                {t("yousend")}
              </p>
              <input type="text" value="1000" readOnly />
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
              <input type="text" value={"12 560 000"} readOnly />
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
                <button >
                  {t('transactions.regOffer.verify')}
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
    transactions.map((transaction, index) => (
      <>
        {(() => {
          // Normalize status for translation lookup
          const s = (transaction.status || '').toLowerCase();
          const map = {
            pending: 'waiting',
            waiting: 'waiting',
            inreview: 'support',
            review: 'support',
            support: 'support',
            delivered: 'success',
            completed: 'success',
            success: 'success',
            canceled: 'cancel',
            cancelled: 'cancel',
            cancel: 'cancel'
          };
          transaction.__normStatus = map[s] || s || 'waiting';
          return null;
        })()}
                    <tr key={index} className='transaction-list-rowD' onClick={() => navigate(`transaction/${transaction.id}`)}>
                      <td className='transaction-list-name'>
                        <div>
                          <img src={`/images/transicon${theme}.png`} alt="icon" />
                        </div>
                        <div>
                          <h4>
                            {transaction.type === "send" ? transaction.receiverName : transaction.sanderName}
                          </h4>
                          <p>
                            {toCardResolved} {transaction.receiverCardNumber.slice(-4)}
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
                      <td className={`transaction-list-status 
                    ${transaction.status === "waiting"
                          ?
                          "waiting"
                          :
                          transaction.status === "support"
                            ?
                            "support"
                            :
                            transaction.status === "success"
                              ?
                              "success"
                              :
                              "cancel"
                        }`}>
                        <div>
                          {
                            transaction.status === "waiting"
                              ?
                              <Clock size={15} />
                              :
                              transaction.status === "support"
                                ?
                                <MessagesSquare size={15} />
                                :
                                transaction.status === "success"
                                  ?
                                  <Check size={15} />
                                  :
                                  <MinusCircle size={15} />
                          }
                          <p>
                            {translateStatus(transaction.__normStatus)}
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr key={`M${index}`} className='transaction-list-rowM' onClick={() => navigate(`transaction/${transaction.id}`)}>
                      <td className='transaction-list-name'>
                        <div>
                          <img src={`/images/transicon${theme}.png`} alt="icon" />
                        </div>
                        <div>
                          <h4>
                            {transaction.type === "send" ? transaction.receiverName : transaction.sanderName}
                          </h4>
                          <p>
                            {toCardResolved} {transaction.receiverCardNumber.slice(-4)}
                          </p>
                        </div>

                      </td>
                      <td className='transaction-list-date'>
                        <h5>
                        {transaction.date}
                        </h5>
                        <div className={`transaction-list-status 
                          ${transaction.status === "waiting"
                            ?
                            "waiting"
                            :
                            transaction.status === "support"
                              ?
                              "support"
                              :
                              transaction.status === "success"
                                ?
                                "success"
                                :
                                "cancel"
                          }`}>
                          <div>
                            {
                              transaction.status === "waiting"
                                ?
                                <Clock size={15} />
                                :
                                transaction.status === "support"
                                ?
                                <MessagesSquare size={15} />
                                :
                                transaction.status === "success"
                                ?
                                <Check size={15} />
                                :
                                <MinusCircle size={15}/>
                            }
                          </div>
                          <p>
                          -{transaction.amountInOther} {transaction.currencyInOther}
                        </p>
                        </div>
                        
                      </td>
                    </tr>

                  </>
                ))
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
