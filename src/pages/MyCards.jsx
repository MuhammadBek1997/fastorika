import React from 'react'
import { useGlobalContext } from '../Context'

const MyCards = () => {
  let {t,theme} = useGlobalContext()
  return (
    <div className='myCards' id='webSection'>
      <div className="myCards-navbar">
        <h2 className='myCards-head'>
          {t('myCards.title')}
        </h2>
        <button className='myCardsBtn'>
          {t('myCards.addButton')}
        </button>
      </div>
      <div className="myCards-body">
        
      </div>
    </div>
  )
}

export default MyCards