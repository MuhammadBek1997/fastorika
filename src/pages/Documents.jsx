import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { ChevronRight } from 'lucide-react'

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
                        {t('documentsPage.title')}
                    </h3>
                </div>
            </div>
            <div className='settings-body'>
                <Link to={'/politics'}>
                    <div className="date-input-container">
                        {t('documentsPage.politics')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/politicsAml'}>
                    <div className="date-input-container">
                        {t('documentsPage.privacy')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/termService'}>
                    <div className="date-input-container">
                        {t('documentsPage.amlPrivacy')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/serviceTerm'}>
                    <div className="date-input-container">
                        {t('documentsPage.termService')}
                        <ChevronRight />
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Documents