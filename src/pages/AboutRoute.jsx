import React from 'react'
import { useGlobalContext } from '../Context'
import { Link } from 'react-router-dom'

const AboutRoute = () => {
    let {t,theme} = useGlobalContext()

    
  return (
    <section id='webSection'>
        <div className='settings-navbar'>
            <div className="settings-navbar-cont">
                <div className='settings-back-btn'>
                    <div className='date-input-container'>
                        <Link to={'/settings'}>
                            <img src={`/images/left${theme}.png`} alt="" />
                        </Link>
                    </div>
                </div>
                <h3>
                    {t("aboutUs")}
                </h3>
            </div>
        </div>
      <div className='about-hero'>
        <div className="about-hero-left">
          <h1>
            {t("abouthero1")}
          </h1>
          <p>
            {t("abouthero2")}
          </p>
          <img src="/images/aboutHeroImg.png" alt="" />
        </div>
        <div className="about-hero-right">
          <img src="/images/aboutHeroPhoto.png" alt="" className='forD' />
          <img src="/images/aboutHeroPhoto2.png" alt="" className='forM' />
        </div>
      </div>
      <div className='about-ourmission'>
        <h1>
          {t("ourmissionhead")}
        </h1>
        <p>
          {t("ourmissionsecond")}

        </p>
        <div className='about-ourmission-list' id='aboutRoute'>
          <div className='ourmission-card'>
            <img src="/images/ourMissionSecure.png" alt="" />
            <h3>
              {t("ourmission11")}

            </h3>
            <p style={{
              width:"auto"
            }}>
              {t("ourmission12")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionFast.png" alt="" />
            <h3>
              {t("ourmission21")}

            </h3>
            <p style={{
              width:"auto"
            }}>
              {t("ourmission22")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionAcces.png" alt="" />
            <h3>
              {t("ourmission31")}

            </h3>
            <p style={{
              width:"auto"
            }}>
              {t("ourmission32")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionTrust.png" alt="" />
            <h3>
              {t("ourmission41")}

            </h3>
            <p style={{
              width:"auto"
            }}>
              {t("ourmission42")}
            </p>
          </div>

        </div>
      </div>
      <div className='about-trust' id='aboutRoute'>
        <h1>
          {t("trusthead")}
        </h1>
        <p>
          {t("trustsecond")}
        </p>
        <div className='about-trust-list'>
          <div className='trust-card'>
            <h4>
              {t("trust11")}

            </h4>
            <p>
              {t("trust12")}

            </p>
          </div>
          <div className='trust-card'>
            <h4>
              {t("trust21")}

            </h4>
            <p>
              {t("trust22")}

            </p>
          </div>
          <div className='trust-card'>
            <h4>
              {t("trust31")}

            </h4>
            <p>
              {t("trust32")}

            </p>
          </div>
        </div>
      </div>
      <div className='about-transfer'>
        <div className='about-transfer-head'>
          <img src="/images/transferhead.png" alt="" />
          <h4>
            {t("transfertop")}
          </h4>
        </div>
        <h1>
          {t("transferhead")}
        </h1>
        <p>
          {t("transfersecond")}
        </p>
        <Link to="/unregcur">
          <button>
            {t("transfersend")}
          </button>
        </Link>
      </div>
    </section>
  )
}

export default AboutRoute