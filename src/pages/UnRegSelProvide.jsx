
import { useGlobalContext } from "../Context"
import { useLocation, useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import "../styles/unregselprovide.css"
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react"

const UnRegSelProvide = () => {
  const { t, theme, transferData, updateTransferData } = useGlobalContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if this is a crypto transfer from global context
  const isCryptoTransfer = transferData?.paymentMethod === 'CRYPTO' || transferData?.cryptoCurrency
  const cryptoCurrency = transferData?.cryptoCurrency || 'USDT'

  // Network options based on crypto currency
  const networkOptions = {
    USDT: [
      { code: 'TRC20', name: 'Tron (TRC20)', fee: 'Low fee' },
      { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
      { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
    ],
    BTC: [
      { code: 'BTC', name: 'Bitcoin Network', fee: 'Variable' }
    ],
    ETH: [
      { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
      { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
    ],
    USDC: [
      { code: 'ERC20', name: 'Ethereum (ERC20)', fee: 'High fee' },
      { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
    ],
    BNB: [
      { code: 'BEP20', name: 'BSC (BEP20)', fee: 'Low fee' }
    ]
  }

  const availableNetworks = networkOptions[cryptoCurrency] || networkOptions['USDT']
  const [selectedNetwork, setSelectedNetwork] = useState(availableNetworks[0])
  const [isNetworkOpen, setIsNetworkOpen] = useState(false)
  const [cryptoTermsChecked, setCryptoTermsChecked] = useState(false)

  // Volet payment service provider
  const defaultProviders = useMemo(() => ([
    {
      id: 'volet-service',
      name: 'Volet',
      commission: '0%',
      icon: null,
      type: 'VOLET'
    }
  ]), [t])

  // Prefer providers passed via route state; otherwise use defaults
  const providers = (location.state?.providers && Array.isArray(location.state.providers) && location.state.providers.length > 0)
    ? location.state.providers
    : defaultProviders

  const [selectedId, setSelectedId] = useState(providers[0]?.id)

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleContinue = (provider) => {
    if (!provider) return

    // For crypto transfers, validate that terms are checked
    if (isCryptoTransfer && !cryptoTermsChecked) {
      return
    }

    // Save to global context
    const updateData = {
      selectedProvider: provider,
      step3Completed: true
    }

    // Add network info for crypto transfers
    if (isCryptoTransfer) {
      updateData.selectedNetwork = selectedNetwork
      updateData.cryptoDetails = {
        cryptoCurrency: cryptoCurrency,
        blockchainNetwork: selectedNetwork.code,
        networkName: selectedNetwork.name,
        walletAddress: transferData?.recipient?.walletAddress,
        receiverName: transferData?.recipient?.receiverName
      }
    }

    // Save to global context and navigate
    updateTransferData(updateData)
    navigate('/instruction')
  }

  return (
    <div className="payment-container">
      <div className="currency-head-back">
                <button
                    onClick={() => navigate(-1)}
                    className="back-btn"
                >
                    <ArrowLeft size={24} />
                    {t("back")}
                </button>

            </div>
      <div className="payment-card">
        <div className="payment-header">
          <h1>{t('paymentSystem')}</h1>
          <p>{t('selectPaymentSystem')}</p>
        </div>

        <div className="payment-list">
        {providers.map((p) => {
          const isActive = selectedId === p.id
          return (
            <div key={p.id} className="payment-method" onClick={() => handleSelect(p.id)}>
              <div className="payment-method-header">
                <div className="payment-method-info">
                  {p.icon
                    ? <img src={p.icon} alt={p.name} className="payment-method-icon" />
                    : <div className="payment-method-icon" style={{ background: 'var(--border-light)' }} />}
                  <div className="payment-method-details">
                    <h3>{p.name}</h3>
                    <p>{t('commission')} {p.commission}</p>
                  </div>
                </div>
                <div className={`radio-button ${isActive ? 'active' : ''}`}></div>
              </div>

              {/* Network Selection - shown for crypto when Volet is selected */}
              {isActive && isCryptoTransfer && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    {t("selectNetwork") || "Выберите сеть"}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsNetworkOpen(!isNetworkOpen) }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        border: '1px solid var(--border-light, #e5e7eb)',
                        borderRadius: '8px',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          {selectedNetwork.code.slice(0, 3)}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedNetwork.name}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{selectedNetwork.fee}</div>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        style={{
                          transform: isNetworkOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>
                    {isNetworkOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: theme === 'dark' ? '#2a2a2a' : '#fff',
                        border: '1px solid var(--border-light, #e5e7eb)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        marginTop: '4px'
                      }}>
                        {availableNetworks.map((network) => (
                          <button
                            key={network.code}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNetwork(network)
                              setIsNetworkOpen(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              background: selectedNetwork.code === network.code
                                ? (theme === 'dark' ? 'rgba(0, 210, 106, 0.1)' : 'rgba(0, 210, 106, 0.1)')
                                : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--border-light, #e5e7eb)'
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              fontWeight: 600
                            }}>
                              {network.code.slice(0, 3)}
                            </div>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{network.name}</div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{network.fee}</div>
                            </div>
                            {selectedNetwork.code === network.code && (
                              <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Network Warning - compact */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.5rem',
                    marginTop: '0.75rem',
                    backgroundColor: theme === 'dark' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.08)',
                    border: '1px solid rgba(234, 179, 8, 0.25)'
                  }}>
                    <AlertCircle size={16} style={{ color: '#eab308', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0, lineHeight: 1.3 }}>
                      {t("cryptoNetworkWarning") || "Убедитесь, что адрес принадлежит сети " + selectedNetwork.name + ". Отправка в неправильную сеть может привести к потере средств."}
                    </p>
                  </div>

                  {/* Terms Checkbox - compact */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <input
                      type="checkbox"
                      id="cryptoNetworkTerms"
                      checked={cryptoTermsChecked}
                      onChange={(e) => setCryptoTermsChecked(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '1rem', height: '1rem', flexShrink: 0 }}
                    />
                    <label htmlFor="cryptoNetworkTerms" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                      {t("confirmNetworkAddress") || "Подтверждаю соответствие адреса выбранной сети"}
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); handleContinue(p) }}
                className={`continue-button ${isActive ? 'primary' : 'secondary'}`}
                disabled={!isActive || (isCryptoTransfer && !cryptoTermsChecked)}
              >
                {t('continue')}
              </button>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default UnRegSelProvide