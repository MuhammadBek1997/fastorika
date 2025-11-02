import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const PoliticsAndCon = () => {
    let {t,theme} = useGlobalContext()

    return (
        <div className='politics' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-back-btn'>
                    <Link to={'/docs'}>
                        <div className='date-input-container'>
                            <img src={`/images/left${theme}.png`} alt="" />
                        </div>
                    </Link>
                </div>
            </div>
            <div className='politics-body'>

            </div>
        </div>
    )
}

export default PoliticsAndCon