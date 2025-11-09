import React from 'react'
import './settings.css'
import { useGlobalContext } from '../Context'

const Support = () => {
  const { t } = useGlobalContext()
  return (
    <div id='webSection'>
      <div className='settings-navbar'>
        <div className="settings-navbar-cont">
          {t('supportPage.title')}
        </div>
      </div>
    </div>
  )
}

export default Support