import { Link } from "react-router-dom"


const Settings = () => {
  return (
    <div className="settings" id='webSection'>
        <div className="settings-navbar">
          <div className="settings-navbar-cont">
            <h3>
              Settings
            </h3>
          </div>
        </div>
        <div className="settings-body">
            <Link to={'/support'}>
          <div className="date-input-container">
              Contact Support
          </div>
            </Link>
            <Link to={'/docs'}>
          <div className="date-input-container">
              Documents
          </div>
            </Link>
            <Link to={'/faqs'}>
          <div className="date-input-container">
              FAQ's
          </div>
            </Link>
            <Link to={'/aboutUs'}>
          <div className="date-input-container">
              About Us
          </div>
            </Link>

        </div>
    </div>
  )
}

export default Settings