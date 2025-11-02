
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const ServiceTerm = () => {
    let {t,theme} = useGlobalContext()

    return (
        <div className='serviceTerm' id='webSection'>
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
                        {t("documentsPage.termService")}
                    </h3>
                </div>
            </div>
            <div className='serviceTerm-body'>
                
            </div>
        </div>
    )
}

export default ServiceTerm