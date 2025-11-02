import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

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
                
            </div>
        </div>
    )
}

export default TermService