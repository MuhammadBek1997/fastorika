import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useGlobalContext } from "../Context"
import { ChevronLeft, Wallet, AlertCircle, ChevronRight, ArrowRight } from "lucide-react"

const UnRegCryp = () => {
  const { t, theme } = useGlobalContext()
  const navigate = useNavigate()
  const location = useLocation()

  // Get transfer data from previous page
  const transferData = location.state || {}

  // Extract transfer summary from previous page
  const {
    sendAmount = '0',
    receiveAmount = '0',
    fromCurrency = 'USD',
    toCurrency = 'UZS',
    fromFlag = 'https://img.icons8.com/color/96/usa-circular.png',
    toFlag = 'https://img.icons8.com/color/96/uzbekistan-circular.png',
    exchangeRate = null,
    feeCalculation = null,
    transferFeePercentage = 10,
    exchangeRateFeePercentage = 2
  } = transferData

  // Crypto currencies available
  const cryptoCurrencies = [
    { code: 'USDT', name: 'Tether USD', icon: '💵' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDC', name: 'USD Coin', icon: '💲' },
    { code: 'BNB', name: 'Binance Coin', icon: '🔶' }
  ]

  // Blockchain networks per crypto
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

  const [selectedCrypto, setSelectedCrypto] = useState(cryptoCurrencies[0])
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions['USDT'][0])
  const [walletAddress, setWalletAddress] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [isCryptoOpen, setIsCryptoOpen] = useState(false)
  const [isNetworkOpen, setIsNetworkOpen] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)

  // Update network options when crypto changes
  useEffect(() => {
    const networks = networkOptions[selectedCrypto.code]
    if (networks && networks.length > 0) {
      setSelectedNetwork(networks[0])
    }
  }, [selectedCrypto])

  // Validate wallet address format
  const validateWalletAddress = (address) => {
    if (!address) return false
    // Basic validation - minimum length
    if (address.length < 26) return false
    // TRC20 addresses start with T
    if (selectedNetwork.code === 'TRC20' && !address.startsWith('T')) return false
    // ERC20/BEP20 addresses start with 0x
    if ((selectedNetwork.code === 'ERC20' || selectedNetwork.code === 'BEP20') && !address.startsWith('0x')) return false
    // BTC addresses start with 1, 3, or bc1
    if (selectedNetwork.code === 'BTC' && !address.match(/^(1|3|bc1)/)) return false
    return true
  }

  const handleContinue = () => {
    if (!walletAddress || !termsChecked) {
      alert(t("fillAllFields") || "Please fill all required fields")
      return
    }

    if (!validateWalletAddress(walletAddress)) {
      alert(t("invalidWalletAddress") || "Invalid wallet address for selected network")
      return
    }

    // Build crypto details for API
    const cryptoDetails = {
      cryptoCurrency: selectedCrypto.code,
      blockchainNetwork: selectedNetwork.code,
      walletAddress: walletAddress,
      receiverName: receiverName || null
    }

    console.log('Continue with crypto payment', cryptoDetails)

    // Navigate to instruction/confirmation page
    navigate('/instruction', {
      state: {
        ...transferData,
        paymentMethod: 'CRYPTO',
        cryptoDetails,
        recipient: {
          ...(transferData.recipient || {}),
          cryptoDetails,
          receiverName: receiverName || null
        }
      }
    })
  }

  return (
    <div className="currency">
      <div className="currency-body">
        <div className="currency-head" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 style={{ margin: 0 }}>{t("cryptoDetails") || "Kripto ma'lumotlari"}</h2>
        </div>

        {/* Transfer Summary Section */}
        <div style={{
          padding: '1rem',
          margin: '0 1rem 1rem',
          background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderRadius: '12px'
        }}>
          {/* Amount Summary */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                {t("yousend") || "Siz yuborasiz"}
              </p>
              <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {sendAmount} {fromCurrency}
              </h3>
            </div>
            <ArrowRight size={20} style={{ opacity: 0.5 }} />
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>
                {t("willtake") || "Qabul qiladi"}
              </p>
              <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>
                {receiveAmount} {toCurrency}
              </h3>
            </div>
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("exchangeRate") || "Ayirboshlash kursi"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                1 {fromCurrency} = {typeof exchangeRate === 'object' ? exchangeRate.rate?.toLocaleString('en-US', { maximumFractionDigits: 4 }) : exchangeRate?.toLocaleString('en-US', { maximumFractionDigits: 4 })} {toCurrency}
              </span>
            </div>
          )}

          {/* Fees */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
              {t("fee") || "Komissiya"}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              {feeCalculation ? `${feeCalculation.transferFeePercentage}%` : `${transferFeePercentage}%`}
            </span>
          </div>

          {feeCalculation && feeCalculation.transferFeeAmount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("feeCount") || "Komissiya miqdori"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {feeCalculation.transferFeeAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {fromCurrency}
              </span>
            </div>
          )}

          {feeCalculation && feeCalculation.exchangeRateFeePercentage > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {t("exchangeRateFee") || "Ayirboshlash kursi komissiyasi"}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {feeCalculation.exchangeRateFeePercentage}%
              </span>
            </div>
          )}
        </div>

        <p style={{
          padding: '0 1rem',
          fontSize: '0.9rem',
          opacity: 0.7,
          marginBottom: '1rem'
        }}>
          {t("enterCryptoWalletInfo") || "Qabul qiluvchining kripto hamyon ma'lumotlarini kiriting"}
        </p>

        <div style={{ padding: '0 1rem' }}>
          {/* Crypto Currency Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("selectCryptoCurrency") || "Kriptovalyutani tanlang"}
            </label>
            <div className="date-input-container" style={{ padding: 0 }}>
              <button
                onClick={() => setIsCryptoOpen(!isCryptoOpen)}
                className="country-select-btn"
                style={{ width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{selectedCrypto.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 500 }}>{selectedCrypto.code}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{selectedCrypto.name}</div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  style={{
                    transform: isCryptoOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              {isCryptoOpen && (
                <div className="country-dropdown-menu" style={{ position: 'relative', marginTop: '0.5rem' }}>
                  {cryptoCurrencies.map((crypto) => (
                    <button
                      key={crypto.code}
                      onClick={() => {
                        setSelectedCrypto(crypto)
                        setIsCryptoOpen(false)
                      }}
                      className={`country-option ${selectedCrypto.code === crypto.code ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{crypto.icon}</span>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{crypto.code}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{crypto.name}</div>
                      </div>
                      {selectedCrypto.code === crypto.code && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Network Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("selectNetwork") || "Tarmoqni tanlang"}
            </label>
            <div className="date-input-container" style={{ padding: 0 }}>
              <button
                onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                className="country-select-btn"
                style={{ width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {selectedNetwork.code.slice(0, 3)}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 500 }}>{selectedNetwork.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{selectedNetwork.fee}</div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  style={{
                    transform: isNetworkOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              {isNetworkOpen && (
                <div className="country-dropdown-menu" style={{ position: 'relative', marginTop: '0.5rem' }}>
                  {networkOptions[selectedCrypto.code]?.map((network) => (
                    <button
                      key={network.code}
                      onClick={() => {
                        setSelectedNetwork(network)
                        setIsNetworkOpen(false)
                      }}
                      className={`country-option ${selectedNetwork.code === network.code ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {network.code.slice(0, 3)}
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{network.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{network.fee}</div>
                      </div>
                      {selectedNetwork.code === network.code && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wallet Address */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("walletAddress") || "Hamyon manzili"} *
            </label>
            <div className="date-input-container">
              <Wallet size={20} style={{ opacity: 0.5, marginRight: '0.5rem' }} />
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={
                  selectedNetwork.code === 'TRC20' ? 'T...' :
                  selectedNetwork.code === 'BTC' ? '1... / 3... / bc1...' :
                  '0x...'
                }
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            {walletAddress && !validateWalletAddress(walletAddress) && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {t("invalidWalletFormat") || "Noto'g'ri hamyon manzil formati"}
              </p>
            )}
          </div>

          {/* Receiver Name (Optional) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              {t("receiverName") || "Qabul qiluvchi ismi"} ({t("optional") || "ixtiyoriy"})
            </label>
            <div className="date-input-container">
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder={t("enterReceiverName") || "Ismni kiriting"}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Network Warning */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: '1rem',
            marginBottom: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)'
          }}>
            <AlertCircle size={20} style={{ color: '#eab308', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>
              {t("cryptoNetworkWarning") || `Iltimos, manzil ${selectedNetwork.name} tarmog'iga tegishli ekanligiga ishonch hosil qiling. Noto'g'ri tarmoqqa yuborish mablag'larning yo'qolishiga olib kelishi mumkin.`}
            </p>
          </div>

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="terms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem', marginTop: '2px', flexShrink: 0 }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {t("confirmWalletAddress") || "Men hamyon manzili to'g'ri ekanligini va tanlangan tarmoqqa mos kelishini tasdiqlayman"}
            </label>
          </div>

          {/* Continue Button */}
          <button
            className="currency-continueBtn"
            onClick={handleContinue}
            disabled={!walletAddress || !termsChecked || !validateWalletAddress(walletAddress)}
            style={{
              opacity: (!walletAddress || !termsChecked || !validateWalletAddress(walletAddress)) ? 0.5 : 1
            }}
          >
            {t('continue') || "Davom etish"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnRegCryp