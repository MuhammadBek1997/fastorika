import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../Context'

const Footer = () => {
    let {t} = useGlobalContext()

  return (
    <div className='footer'>
        <div className='footer-top'>
            <img src="/images/logo-footer.png" alt="" />
            <div className='footer-top-right'>
                <Link to={'/about'}>
                    {t("aboutUs")}
                </Link>
                <a href="">
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