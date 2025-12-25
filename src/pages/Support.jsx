import React, { useState } from 'react'
import './settings.css'
import { useGlobalContext } from '../Context'
import { ArrowUp, Paperclip } from 'lucide-react'

const Support = () => {
  const { t } = useGlobalContext()
  const [message, setMessage] = useState('')

  // Mock messages data
  const mockMessages = [
    {
      id: 1,
      sender: 'admin',
      text: 'Здравствуйте, у меня есть сложности с началом нового дела. Можете помочь?',
      time: '14:20',
      date: '12 марта, 2025'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Здравствуйте, у меня есть сложности с началом нового дела. Можете помочь?',
      time: '14:20',
      date: null
    },
    {
      id: 3,
      sender: 'admin',
      text: 'Здравствуйте, у меня есть сложности с началом нового дела. Можете помочь?',
      time: '14:20',
      date: null
    },
    {
      id: 4,
      sender: 'admin',
      fileName: 'Название файла.PNG',
      fileSize: '88.4 кБ',
      time: '14:20',
      date: null
    },
    {
      id: 5,
      sender: 'user',
      text: 'Здравствуйте, у меня есть сложности с началом нового дела. Можете помочь?',
      time: '14:20',
      date: null
    },
    {
      id: 6,
      sender: 'user',
      text: 'Здравствуйте, у меня есть сложности с началом нового дела. Можете помочь?',
      time: '14:20',
      date: null
    }
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div id='webSection' className='supportRoute'>
      <div className='settings-navbar'>
        <div className="settings-navbar-cont">
          {t('supportPage.title') || 'Чат с поддержкой'}
        </div>
      </div>
      <div className="support-body">
        <div className='support-conversations'>
          {mockMessages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              {msg.date && (
                <div className="support-date-divider">
                  <span>{msg.date}</span>
                </div>
              )}

              <div className={`support-message ${msg.sender === 'user' ? 'support-message-user' : 'support-message-admin'}`}>
                <div className="support-message-content">
                  {msg.text && <div className="support-message-text">{msg.text}</div>}

                  {msg.fileName && (
                    <div className="support-message-file">
                      <div className="support-file-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="13 2 13 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="support-file-info">
                        <div className="support-file-name">{msg.fileName}</div>
                        <div className="support-file-size">{msg.fileSize}</div>
                      </div>
                    </div>
                  )}

                  <div className="support-message-time">{msg.time}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className='support-input-cont'>
          <button className="support-attach-btn">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder={t('supportPage.inputPlaceholder') || 'Введите сообщение...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="support-send-btn">
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Support