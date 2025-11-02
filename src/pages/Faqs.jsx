import { Link } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronDown, ChevronRight } from "lucide-react"

const Faqs = () => {
    let { t, theme, faqData, toggleAccordion, openIndex } = useGlobalContext()


    return (
        <div className='faqs' id='webSection'>
            <div className='settings-navbar'>
                <div className="settings-navbar-cont">
                    <div className='settings-back-btn'>
                        <div className='date-input-container'>
                            <Link to={'/settings'}>
                                <img src={`/images/left${theme}.png`} alt="" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className='faq'>
                <div className='faq-left'>
                    <h2>
                        {t("faqhead")}
                    </h2>
                    <p>
                        {t("faqsecond")}
                    </p>
                    <Link to={'/support'}>
                        <a href="" className='faq-ancor'>
                            <div>
                                <img src="/images/faqIcon.png" alt="" />
                                {t("faqancor")}
                            </div>
                            <ChevronRight />
                        </a>
                    </Link>
                </div>
                <div className="faq-accordion">
                    {faqData.map((faq, index) => (
                        <div key={index} className="accordion-card">
                            <div
                                className="accordion-title"
                                onClick={() => toggleAccordion(index)}
                            >
                                <h3>{faq.question}</h3>
                                <ChevronDown className={openIndex === index ? 'rotate' : ''} />
                            </div>

                            <div className={`accordion-body ${openIndex === index ? 'open' : ''}`}>
                                <div className="accordion-body-content">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Faqs