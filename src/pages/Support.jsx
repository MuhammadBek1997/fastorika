import React from 'react'
import './settings.css'
import { useGlobalContext } from '../Context'
import { ArrowUp } from 'lucide-react'

const Support = () => {
  const { t } = useGlobalContext()
  return (
    <div id='webSection' className='support'>
      <div className='settings-navbar'>
        <div className="settings-navbar-cont">
          {t('supportPage.title')}
        </div>
      </div>
      <div className="support-body">
        <div className='support-conversations'>
          
        </div>
        <div className='support-input-cont'>
          <input type="text" />
          <button>
            <ArrowUp/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Support