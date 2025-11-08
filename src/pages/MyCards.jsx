import { useGlobalContext } from '../Context'
import AddCardModal from './AddCardModal'

const MyCards = () => {
  let {t,theme,addCardModal,setAddCardModal} = useGlobalContext()

  return (
    <div className='myCards' id='webSection'>
      <div className="myCards-navbar">
        <h2 className='myCards-head'>
          {t('myCards.title')}
        </h2>
        <button className='myCardsBtn' onClick={()=>setAddCardModal(true)}>
          {t('myCards.addButton')}
        </button>
      </div>
      <div className="myCards-body">
        
      </div>
      {addCardModal && <AddCardModal />}
    </div>
  )
}

export default MyCards