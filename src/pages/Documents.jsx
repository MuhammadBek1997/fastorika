import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const Documents = () => {
    let { t, theme } = useGlobalContext()

    return (
        <div className='documents' id='webSection'>

            <div className="settings-navbar">
                <div className="settings-navbar-cont">
                    <div className='settings-back-btn'>
                        <Link to={'/settings'}>
                            <div className='date-input-container'>
                                <img src={`/images/left${theme}.png`} alt="" />
                            </div>
                        </Link>
                    </div>
                    <h3>
                        Legal Documents
                    </h3>
                </div>
            </div>
            <div className='settings-body'>
                
            </div>
        </div>
    )
}

export default Documents