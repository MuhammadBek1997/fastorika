
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const ServiceTerm = () => {
    let {t,theme} = useGlobalContext()

    return (
        <div className='serviceTerm' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-back-btn'>
                    <Link to={'/docs'}>
                        <div className='date-input-container'>
                            <img src={`/images/left${theme}.png`} alt="" />
                        </div>
                    </Link>
                </div>
            </div>
            <div className='serviceTerm-body'>

            </div>
        </div>
    )
}

export default ServiceTerm