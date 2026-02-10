import React, { useState, useEffect, useRef } from 'react'
import './settings.css'
import { useGlobalContext } from '../Context'
import { ArrowUp, Paperclip } from 'lucide-react'
import useChatStomp from '../hooks/useChatStomp'

const Support = () => {
  const { t, user } = useGlobalContext()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  const {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    error,
    markAsRead
  } = useChatStomp()

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (isConnected && messages.length > 0) {
      markAsRead()
    }
  }, [isConnected, messages.length, markAsRead])

  const handleSendMessage = async () => {
    if (message.trim()) {
      const success = await sendMessage(message)
      if (success) {
        setMessage('')
      }
    }
  }

  // Group messages by date
  const getGroupedMessages = () => {
    const grouped = []
    let lastDate = null

    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString()
      if (msgDate !== lastDate) {
        grouped.push({ type: 'date', date: msgDate, id: `date-${msgDate}` })
        lastDate = msgDate
      }
      grouped.push({
        ...msg,
        type: 'message',
        id: msg.id,
        sender: msg.senderType,
        text: msg.content || msg.messageText,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fileName: msg.fileUrl ? msg.fileUrl.split('/').pop() : null
      })
    })
    return grouped
  }

  const displayMessages = getGroupedMessages()

  // Status message
  const getStatusMessage = () => {
    if (isLoading) return { text: t('connecting') || 'Подключение...', type: 'info' }
    if (error) return { text: error, type: 'error' }
    if (!isConnected) return { text: t('disconnected') || 'Отключено', type: 'info' }
    if (displayMessages.length === 0) return { text: t('startChat') || 'Напишите ваше первое сообщение...', type: 'placeholder' }
    return null
  }

  const statusMessage = getStatusMessage()

  return (
    <div id='webSection' className='supportRoute'>
      <div className='settings-navbar'>
        <div className="settings-navbar-cont">
          {t('supportPage.title') || 'Чат с поддержкой'}
        </div>
      </div>
      <div className="support-body">
        <div className='support-conversations'>
          {statusMessage && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: statusMessage.type === 'error' ? '#ef4444' : 'rgba(136, 136, 136, 0.5)',
              fontSize: statusMessage.type === 'placeholder' ? '0.95rem' : '0.85rem',
              fontWeight: statusMessage.type === 'placeholder' ? '400' : '500'
            }}>
              {statusMessage.text}
            </div>
          )}

          {displayMessages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.type === 'date' ? (
                <div className="support-date-divider">
                  <span>{msg.date}</span>
                </div>
              ) : (
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
                        </div>
                      </div>
                    )}

                    <div className="support-message-time">{msg.time}</div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='support-input-cont'>
          <button className="support-attach-btn" disabled={!isConnected}>
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder={t('supportPage.inputPlaceholder') || 'Введите сообщение...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            className="support-send-btn"
            disabled={!isConnected || !message.trim()}
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Support
