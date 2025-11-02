import React from 'react'
import { useGlobalContext } from '../Context'

const Support = () => {
  const { t } = useGlobalContext()
  return (
    <div id='webSection'>
      {t('supportPage.title')}
    </div>
  )
}

export default Support