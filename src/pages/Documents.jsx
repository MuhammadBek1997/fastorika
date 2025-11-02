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
                <Link to={'/support'}>
                    <div className="date-input-container">
                        {t('settingsPage.contactSupport')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/docs'}>
                    <div className="date-input-container">
                        {t('settingsPage.documents')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/faqs'}>
                    <div className="date-input-container">
                        {t('settingsPage.faqs')}
                        <ChevronRight />
                    </div>
                </Link>
                <Link to={'/aboutUs'}>
                    <div className="date-input-container">
                        {t('settingsPage.aboutUs')}
                        <ChevronRight />
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Documents