
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context'
import { Trans } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

const ServiceTerm = () => {
    let {t,theme, isAuthenticated} = useGlobalContext()
    const navigate = useNavigate()

    return (
        <div className='serviceTerm' id='webSection'>
            <div className='settings-navbar'>
                <div className='settings-navbar-cont'>
                    <div className='settings-back-btn'>
                        <button onClick={() => navigate(isAuthenticated ? '/docs' : '/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <div className='date-input-container'>
                                <ArrowLeft/>
                            </div>
                        </button>
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
                <h2>
                    {t('termsTitle')}
                </h2>
                <p>
                    <Trans i18nKey="terms" />
                </p>
            </div>
        </div>
    )
}

export default ServiceTerm
