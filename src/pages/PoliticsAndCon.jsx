import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { Trans } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

const PoliticsAndCon = () => {
    let {t,theme} = useGlobalContext()

    return (
        <div className='politics' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-navbar-cont'>
                    <div className='settings-back-btn'>
                        <Link to={'/docs'}>
                            <div className='date-input-container'>
                                <ArrowLeft/>
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
                        {t("documentsPage.politics")}
                    </h3>
                </div>
            </div>
            <div className='politics-body'>
                <h2>
                    {t("documentsPage.politics")}
                </h2>
                <p>
                    <Trans i18nKey="politics" />
                </p>
            </div>
        </div>
    )
}

export default PoliticsAndCon