import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { Trans } from 'react-i18next'

const TermService = () => {
    let { t, theme } = useGlobalContext()

    return (
        <div className='termService' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-navbar-cont'>
                    <div className='settings-back-btn'>
                        <Link to={'/docs'}>
                            <div className='date-input-container'>
                                <img src={`/images/left${theme}.png`} alt="" />
                            </div>
                        </Link>
                    </div>
                    <h3>
                        <span style={{
                            opacity:"0.5",
                            marginRight:"0.5rem"
                        }}>
                            {t("documentsPage.title")} /
                        </span>
                        {t("documentsPage.amlPrivacy")}
                    </h3>
                </div>
            </div>
            <div className='termService-body'>
                <h2>
                    {t('termsTitle')}
                </h2>
                <p>
                    <Trans i18nKey="terms" />
                </p>
            </div>
        </div>
    )
}

export default TermService
