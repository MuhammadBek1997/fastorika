import { ArrowLeft, ArrowRight, Check, Clock, MessagesSquare, MinusCircle, Printer, RotateCw } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const TransactionInfo = () => {
    let { id } = useParams()
    let { t, navigate, transactions ,countries} = useGlobalContext()

    let currentTrans = transactions.find(item => item.id == id)

    let senderFlagicon = countries.find(item=>item.name == currentTrans.senderState)
    let receiverFlagicon = countries.find(item=>item.name == currentTrans.receiverState)


    // {
    //   id: 1,
    //   date: "2023-08-15",
    //   time: "10:30 AM",
    //   amount: 1000,
    //   amountInOther: 850,
    //   currency: "USD",
    //   currencyInOther: "UZS",
    //   status: "success",
    //   type: "send",
    //   description: "Payment for services",
    //   senderState:"Uzbekistan",
    //   sanderName: "John Doe",
    //   senderCardNumber: "4567-8901-2345-6789",
    //   receiverState:"Russia",
    //   receiverName: "Jane Doe",
    //   receiverCardNumber: "1234-5678-9012-3456",
    //   receiverPhoneNumber: "+998901234567",
    //   transactionFee: 0,
    // },


    return (
        <section id='webSection'>
            <div className='transaction-info-nav'>
                <button className='back-btn' onClick={() => navigate('/transactions')}>
                    <ArrowLeft />
                </button>
                <h3>
                    Transaction number {currentTrans.id}
                </h3>
            </div>
            <div className='transaction-info-body'>
                <div className='transaction-info-cash'>
                    <div className='info-cash-send'>
                        <p>
                            {currentTrans.amount} {currentTrans.currency}
                        </p>
                    </div>
                    <div className='info-cash-icons'>
                        <img src={senderFlagicon.flag} alt="" />
                        <ArrowRight/>
                        <img src={receiverFlagicon.flag} alt="" />
                    </div>
                    <div className='info-cash-receive'>
                        <p>
                            {currentTrans.amountInOther} {currentTrans.currencyInOther}
                        </p>
                    </div>
                </div>
                <div className='transaction-info-data'>
                    <div className={`transaction-info-statusbar ${
                            currentTrans.status === "waiting"
                            ?
                            "waiting"
                            :
                            currentTrans.status === "support"
                              ?
                              "support"
                              :
                              currentTrans.status === "success"
                                ?
                                "success"
                                :
                                "cancel"
                          }`}>
                        {
                            currentTrans.status === "waiting"
                            ?
                            <Clock size={25} />
                            :
                            currentTrans.status === "support"
                            ?
                            <MessagesSquare size={25} />
                            :
                            currentTrans.status === "success"
                            ?
                            <Check size={25} />
                            :
                            <MinusCircle size={25}/>
                        }
                        <h1>
                            {
                                currentTrans.status === "waiting"
                                ?
                                "В обработке"
                                :
                                currentTrans.status === "support"
                                ?
                                "Поддержка"
                                :
                                currentTrans.status === "success"
                                ?
                                "Доставлено"
                                :
                                "Отклонено"
                            }
                        </h1>
                    </div>
                    <div className='transaction-info-datalist'>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Operation number
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {currentTrans.id}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Operation date
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {currentTrans.date}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Comission
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {
                                    currentTrans.transactionFee > 0 
                                    ?
                                    currentTrans.transactionFee 
                                    :
                                    "Without fee"
                                    }
                                </p>
                            </div>
                        </div>
                        <hr />
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Delivery
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    **** {currentTrans.receiverCardNumber.slice(-4)}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Recipient
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {currentTrans.receiverName}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Sender
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {currentTrans.sanderName}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Phone Number
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {currentTrans.receiverPhoneNumber}
                                </p>
                            </div>
                        </div>
                        <hr />
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    Payment
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    From card ··{currentTrans.senderCardNumber.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='transaction-info-btns'>
                        {
                            currentTrans.status == 'success' && (
                                <button>
                                    <Printer />
                                    Print chek
                                </button>

                            )
                        }
                        {
                            currentTrans.status == 'success' || currentTrans.status == 'cancelled' ? (
                                <button className='repeatbtn'>
                                    <RotateCw />
                                    Repeat
                                </button>
                            )
                            :
                            null
                        }
                    </div>
                </div>
            </div>
            <div className='transaction-info-support'>
                <div>
                    <h2>
                        Need Help?
                    </h2>
                    <p>
                        Our specialists will assist you
                    </p>
                </div>
                <button>
                    <MessagesSquare/>
                    Write
                </button>
            </div>
        </section>
    )
}

export default TransactionInfo