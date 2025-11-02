import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const PoliticsAML = () => {
    let { t, theme } = useGlobalContext()

    return (
        <div className='politicsAml' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-back-btn'>
                    <Link to={'/docs'}>
                        <div className='date-input-container'>
                            <img src={`/images/left${theme}.png`} alt="" />
                        </div>
                    </Link>
                </div>
            </div>
            <div className='politicsAml-body'>
                Politics AML
            </div>
        </div>
    )
}

export default PoliticsAML