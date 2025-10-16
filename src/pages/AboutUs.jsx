
import { useGlobalContext } from '../Context'

const AboutUs = () => {

  let {t} = useGlobalContext();

  return (
    <section>
      <div className='about-hero'>
        <div className="about-hero-left">
          <img src="/images/aboutHeroImg.png" alt="" />
          <h1>
            {t("abouthero1")}
          </h1>
          <p>
            {t("abouthero2")}
          </p>
        </div>
        <div className="about-hero-right">
          <img src="/images/aboutHeroPhoto.png" alt="" />
        </div>
      </div>
    </section>
  )
}

export default AboutUs