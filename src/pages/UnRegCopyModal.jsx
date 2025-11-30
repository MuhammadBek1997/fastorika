import { Copy } from 'lucide-react'
import React from 'react'

const UnRegCopyModal = ({setUserverify}) => {
    return (
        <div className='currency-userid-modal'>
            <div className='currency-userid-modal-cont'>
                <div className="userid-modal-top">
                    Fastorika
                    <div className="userid-modal-img">
                        id
                    </div>
                </div>
                <p>
                    Поделитесь ссылкой на регистрацию Fastorika ID и отправляйте переводы мгновенно!
                </p>
                <button onClick={()=>setUserverify(false)}>
                    <Copy size={"1rem"} />
                    Копировать ссылку
                </button>
            </div>
        </div>
    )
}

export default UnRegCopyModal