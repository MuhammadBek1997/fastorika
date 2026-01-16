import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock, MessagesSquare, MinusCircle, Printer, RotateCw, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const TransactionInfo = () => {
    let { id } = useParams()
    let { t, navigate, transactions, countries, getTransactionDetails } = useGlobalContext()

    const [currentTrans, setCurrentTrans] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch transaction details from API or fallback to context
    useEffect(() => {
        const loadTransaction = async () => {
            setLoading(true)
            setError(null)

            // First try to find in local transactions (for quick display)
            const localTrans = transactions.find(item => item.id === id || item.id == id)

            // If ID looks like a UUID, fetch from API for full details
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

            if (isUUID) {
                try {
                    const details = await getTransactionDetails(id)
                    setCurrentTrans(details)
                } catch (e) {
                    console.error('Failed to load transaction details:', e)
                    // Fallback to local if API fails
                    if (localTrans) {
                        setCurrentTrans(localTrans)
                    } else {
                        setError(e?.message || 'Failed to load transaction')
                    }
                }
            } else if (localTrans) {
                setCurrentTrans(localTrans)
            } else {
                setError('Transaction not found')
            }

            setLoading(false)
        }

        loadTransaction()
    }, [id, transactions, getTransactionDetails])

    // Loading state
    if (loading) {
        return (
            <section id='webSection'>
                <div className='transaction-info-nav'>
                    <button className='back-btn' onClick={() => navigate('/transactions')}>
                        <ArrowLeft />
                    </button>
                    <h3>{t('transactionInfo.title')}</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            </section>
        )
    }

    // Error state
    if (error || !currentTrans) {
        return (
            <section id='webSection'>
                <div className='transaction-info-nav'>
                    <button className='back-btn' onClick={() => navigate('/transactions')}>
                        <ArrowLeft />
                    </button>
                    <h3>{t('transactionInfo.title')}</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
                    <p>{error || t('transactionInfo.status.notFound') || 'Transaction not found'}</p>
                    <button onClick={() => navigate('/transactions')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                        {t('back') || 'Back'}
                    </button>
                </div>
            </section>
        )
    }

    // Normalize status for translation lookup
    const statusMap = {
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
    }
    const normStatus = statusMap[(currentTrans.status || '').toLowerCase()] || (currentTrans.status || 'waiting').toLowerCase()

    // Default flag for when country is not found
    const defaultFlag = 'https://img.icons8.com/color/96/globe--v1.png'

    let senderFlagicon = countries.find(item => item.name === currentTrans.senderState || item.code === currentTrans.senderCountryCode)
    let receiverFlagicon = countries.find(item => item.name === currentTrans.receiverState || item.code === currentTrans.receiverCountryCode)


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
                    {t('transactionInfo.title')} {currentTrans.id}
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
                        <img src={senderFlagicon?.flag || defaultFlag} alt="" />
                        <ArrowRight/>
                        <img src={receiverFlagicon?.flag || defaultFlag} alt="" />
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
                            {t(`transactionInfo.status.${normStatus}`)}
                        </h1>
                    </div>
                    <div className='transaction-info-datalist'>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    {t('transactionInfo.operationNumber')}
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
                                    {t('transactionInfo.operationDate')}
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
                                    {t('transactionInfo.commission')}
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {
                                    currentTrans.transactionFee > 0 
                                    ?
                                    currentTrans.transactionFee 
                                    :
                                    t('transactionInfo.withoutFee')
                                    }
                                </p>
                            </div>
                        </div>
                        <hr />
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    {t('transactionInfo.delivery')}
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    **** {(currentTrans.receiverCardNumber || '****').slice(-4)}
                                </p>
                            </div>
                        </div>
                        <div className='transaction-info-datalist-item'>
                            <div className='info-item-left'>
                                <p>
                                    {t('transactionInfo.recipient')}
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
                                    {t('transactionInfo.sender')}
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
                                    {t('transactionInfo.phoneNumber')}
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
                                    {t('transactionInfo.payment')}
                                </p>
                            </div>
                            <div className='info-item-right'>
                                <p>
                                    {t('transactionInfo.fromCard')} ··{(currentTrans.senderCardNumber || '****').slice(-4)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='transaction-info-btns'>
                        {
                            currentTrans.status == 'success' && (
                                <button>
                                    <Printer />
                                    {t('transactionInfo.printCheck')}
                                </button>

                            )
                        }
                        {
                            currentTrans.status == 'success' || currentTrans.status == 'cancelled' ? (
                                <button className='repeatbtn'>
                                    <RotateCw />
                                    {t('transactionInfo.repeat')}
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
                        {t('transactionInfo.needHelp')}
                    </h2>
                    <p>
                        {t('transactionInfo.helpDesc')}
                    </p>
                </div>
                <button>
                    <MessagesSquare/>
                    {t('transactionInfo.write')}
                </button>
            </div>
        </section>
    )
}

export default TransactionInfo
