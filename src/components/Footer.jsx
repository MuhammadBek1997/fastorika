import  { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const Footer = () => {
    let { t } = useGlobalContext()
    const navigate = useNavigate()
    const location = useLocation()


    const handleFaqClick = (e) => {
        e.preventDefault()
        
        if (location.pathname === '/') {
            const element = document.getElementById('faq')
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        } else {
            navigate('/#faq')
        }
    }

    useEffect(() => {
        if (location.hash === '#faq') {
            setTimeout(() => {
                const element = document.getElementById('faq')
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }, 100)
        }
    }, [location])



    return (
        <div className='footer'>
            <div className='footer-top'>
                <img src="/images/logo-footer.png" alt="" />
                <div className='footer-top-right'>
                    <Link to={'/about'} onClick={()=>handleFaqClick()}>
                        {t("aboutUs")}
                    </Link>
                    <a href="/#faq" onClick={()=>handleFaqClick()}>
                        {t("faq")}
                    </a>
                </div>
            </div>
            <div className='footer-middle'>
                <div className='footer-middle-left'>
                    <a href="">
                        <img src="/images/facebook-linkIcon.png" alt="" />
                    </a>
                    <a href="">
                        <img src="/images/instagram-linkIcon.png" alt="" />
                    </a>
                    <a href="">
                        <img src="/images/x-linkIcon.png" alt="" />
                    </a>
                </div>
                <div className="footer-middle-right">
                    <a href="">
                        <img src="/images/appstore-footerPhoto.png" alt="" />
                    </a>
                    <a href="">
                        <img src="/images/googleplay-footerPhoto.png" alt="" />
                    </a>
                </div>
            </div>
            <div className="footer-bottom">
                <div>
                    <a href="">
                        {t("footerlink1")}
                    </a>
                    <a href="">
                        {t("footerlink2")}
                    </a>
                    <a href="">
                        {t("footerlink3")}
                    </a>
                </div>
                <p>
                    {t("footerabout1")}
                </p>
                <p>
                    {t("footerabout2")}
                </p>
                <p>
                    {t("footerabout3")}
                </p>
                <p>
                    {t("footerabout4")}
                </p>
            </div>
        </div>
    )
}

export default Footer