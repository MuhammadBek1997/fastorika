
import { useGlobalContext } from '../Context'

const AboutUs = () => {

  let { t } = useGlobalContext();

  return (
    <section>
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
        <div className='about-ourmission-list'>
          <div className='ourmission-card'>
            <img src="/images/ourMissionSecure.png" alt="" />
            <h3>
              {t("ourmission11")}

            </h3>
            <p>
              {t("ourmission12")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionFast.png" alt="" />
            <h3>
              {t("ourmission21")}

            </h3>
            <p>
              {t("ourmission22")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionAcces.png" alt="" />
            <h3>
              {t("ourmission31")}

            </h3>
            <p>
              {t("ourmission32")}

            </p>
          </div>
          <div className='ourmission-card'>
            <img src="/images/ourMissionTrust.png" alt="" />
            <h3>
              {t("ourmission41")}

            </h3>
            <p>
              {t("ourmission42")}

            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutUs