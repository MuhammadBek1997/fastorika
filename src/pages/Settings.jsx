import { ChevronRight } from "lucide-react"
import './settings.css'
import { Link } from "react-router-dom"
import { useGlobalContext } from "../Context"


const Settings = () => {
  const { t } = useGlobalContext()
  return (
    <div className="settings" id='webSection'>
        <div className="settings-navbar">
          <div className="settings-navbar-cont">
            <h3>
              {t('settingsPage.title')}
            </h3>
          </div>
        </div>
        <div className="settings-body">
            <Link to={'/support'}>
          <div className="date-input-container">
              {t('settingsPage.contactSupport')}
          <ChevronRight/>
          </div>
            </Link>
            <Link to={'/docs'}>
          <div className="date-input-container">
              {t('settingsPage.documents')}
          <ChevronRight/>
          </div>
            </Link>
            <Link to={'/faqs'}>
          <div className="date-input-container">
              {t('settingsPage.faqs')}
          <ChevronRight/>
          </div>
            </Link>
            <Link to={'/aboutUs'}>
          <div className="date-input-container">
              {t('settingsPage.aboutUs')}
          <ChevronRight/>
          </div>
            </Link>

        </div>
    </div>
  )
}

export default Settings