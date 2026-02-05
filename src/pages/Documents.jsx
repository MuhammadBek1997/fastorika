import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const Documents = () => {
    let { t, theme } = useGlobalContext()

    return (
        <div className='documents' id='webSection'>

            <div className="settings-navbar">
                <div className="settings-navbar-cont">
                    <div className='settings-back-btn'>
                        <Link to={'/settings'}>
                            <div className='date-input-container'>
                                <ArrowLeft/>
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