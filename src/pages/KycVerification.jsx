import { useState, useEffect, useRef } from 'react'
import { useGlobalContext } from '../Context'
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import './kyc.css'

const KycVerification = () => {
  const {
    t,
    theme,
    navigate,
    kycStatus,
    kycLoading,
    kycAccessToken,
    initiateKyc,
    refreshKycToken,
    loadKycStatus,
    profileUserId
  } = useGlobalContext()

  const [error, setError] = useState(null)
  const [sdkLoading, setSdkLoading] = useState(false)
  const sdkContainerRef = useRef(null)
  const sdkInstanceRef = useRef(null)

  // Initialize Sumsub WebSDK when we have an access token
  useEffect(() => {
    if (kycAccessToken && sdkContainerRef.current && !sdkInstanceRef.current) {
      loadSumsubSDK()
    }
  }, [kycAccessToken])

  // Load Sumsub WebSDK script dynamically
  const loadSumsubSDK = async () => {
    try {
      setSdkLoading(true)

      // Check if script already loaded
      if (!window.snsWebSdk) {
        // Load the Sumsub WebSDK script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js'
          script.async = true
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      // Wait for snsWebSdk to be available
      await new Promise(resolve => setTimeout(resolve, 500))

      if (window.snsWebSdk) {
        initializeSdk()
      } else {
        throw new Error('Sumsub SDK failed to load')
      }
    } catch (err) {
      console.error('Failed to load Sumsub SDK:', err)
      setError(t('kyc.sdkLoadError') || 'Failed to load verification SDK')
    } finally {
      setSdkLoading(false)
    }
  }

  // Initialize the SDK with access token
  const initializeSdk = async () => {
    try {
      const snsWebSdkInstance = window.snsWebSdk
        .init(kycAccessToken, async () => {
          // Token expiration handler - refresh token
          try {
            const newToken = await refreshKycToken()
            return newToken
          } catch (err) {
            console.error('Token refresh failed:', err)
            return null
          }
        })
        .withConf({
          lang: localStorage.getItem('i18nextLng') || 'en',
          theme: theme === 'dark' ? 'dark' : 'light'
        })
        .withOptions({
          addViewportTag: false,
          adaptIframeHeight: true
        })
        .on('idCheck.onStepCompleted', (payload) => {
        })
        .on('idCheck.onError', (error) => {
          console.error('Verification error:', error)
          setError(error?.message || t('kyc.verificationError'))
        })
        .on('idCheck.onApplicantStatusChanged', (payload) => {
          // Reload KYC status when verification completes
          if (payload?.reviewStatus === 'completed') {
            loadKycStatus()
          }
        })
        .build()

      sdkInstanceRef.current = snsWebSdkInstance
      snsWebSdkInstance.launch('#sumsub-websdk-container')
    } catch (err) {
      console.error('SDK initialization error:', err)
      setError(t('kyc.initError') || 'Failed to initialize verification')
    }
  }

  // Start verification process
  const handleStartVerification = async () => {
    try {
      setError(null)
      await initiateKyc(profileUserId)
    } catch (err) {
      console.error('Failed to start KYC:', err)
      setError(err?.message || t('kyc.startError') || 'Failed to start verification')
    }
  }

  // Render status badge
  const renderStatusBadge = () => {
    if (kycStatus === 'VERIFIED') {
      return (
        <div className="kyc-status-badge verified">
          <CheckCircle size={20} />
          <span>{t('kyc.status.verified') || 'Verified'}</span>
        </div>
      )
    }
    if (kycStatus === 'NOT_VERIFIED') {
      return (
        <div className="kyc-status-badge not-verified">
          <XCircle size={20} />
          <span>{t('kyc.status.notVerified') || 'Not Verified'}</span>
        </div>
      )
    }
    if (kycStatus === 'PENDING') {
      return (
        <div className="kyc-status-badge pending">
          <Clock size={20} />
          <span>{t('kyc.status.pending') || 'Pending Review'}</span>
        </div>
      )
    }
    return null
  }

  // Already verified
  if (kycStatus === 'VERIFIED') {
    return (
      <div className="kyc-page" id="webSection" data-theme={theme}>
        <div className="kyc-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('kyc.title') || 'Identity Verification'}</h2>
        </div>
        <div className="kyc-content">
          <div className="kyc-success-card">
            <CheckCircle size={64} className="success-icon" />
            <h3>{t('kyc.verifiedTitle') || 'Verification Complete'}</h3>
            <p>{t('kyc.verifiedDesc') || 'Your identity has been verified successfully. You now have full access to all features.'}</p>
            <button className="kyc-btn primary" onClick={() => navigate('/profile')}>
              {t('kyc.backToProfile') || 'Back to Profile'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Verification failed
  if (kycStatus === 'NOT_VERIFIED') {
    return (
      <div className="kyc-page" id="webSection" data-theme={theme}>
        <div className="kyc-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('kyc.title') || 'Identity Verification'}</h2>
        </div>
        <div className="kyc-content">
          <div className="kyc-failed-card">
            <XCircle size={64} className="failed-icon" />
            <h3>{t('kyc.failedTitle') || 'Verification Failed'}</h3>
            <p>{t('kyc.failedDesc') || 'Unfortunately, your identity verification was not successful. Please try again or contact support.'}</p>
            <button className="kyc-btn primary" onClick={handleStartVerification} disabled={kycLoading}>
              {kycLoading ? <Loader2 className="animate-spin" size={20} /> : (t('kyc.tryAgain') || 'Try Again')}
            </button>
            <button className="kyc-btn secondary" onClick={() => navigate('/support')}>
              {t('kyc.contactSupport') || 'Contact Support'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Verification in progress (SDK loaded)
  if (kycAccessToken) {
    return (
      <div className="kyc-page" id="webSection" data-theme={theme}>
        <div className="kyc-header">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('kyc.title') || 'Identity Verification'}</h2>
          {renderStatusBadge()}
        </div>
        <div className="kyc-content">
          {sdkLoading && (
            <div className="kyc-loading">
              <Loader2 className="animate-spin" size={32} />
              <p>{t('kyc.loadingSDK') || 'Loading verification...'}</p>
            </div>
          )}
          {error && (
            <div className="kyc-error">
              <p>{error}</p>
              <button className="kyc-btn secondary" onClick={loadSumsubSDK}>
                {t('kyc.retry') || 'Retry'}
              </button>
            </div>
          )}
          <div
            id="sumsub-websdk-container"
            ref={sdkContainerRef}
            className="sumsub-container"
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>
    )
  }

  // Initial state - start verification
  return (
    <div className="kyc-page" id="webSection" data-theme={theme}>
      <div className="kyc-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <h2>{t('kyc.title') || 'Identity Verification'}</h2>
      </div>
      <div className="kyc-content">
        <div className="kyc-intro-card">
          <Shield size={64} className="intro-icon" />
          <h3>{t('kyc.introTitle') || 'Verify Your Identity'}</h3>
          <p>{t('kyc.introDesc') || 'To ensure security and comply with regulations, we need to verify your identity. This process takes just a few minutes.'}</p>

          <div className="kyc-requirements">
            <h4>{t('kyc.requirementsTitle') || 'You will need:'}</h4>
            <ul>
              <li>{t('kyc.requirement1') || 'A valid government-issued ID (passport, driving license, or national ID)'}</li>
              <li>{t('kyc.requirement2') || 'A device with a camera for taking photos'}</li>
              <li>{t('kyc.requirement3') || 'Good lighting for clear photos'}</li>
            </ul>
          </div>

          {error && (
            <div className="kyc-error-inline">
              <p>{error}</p>
            </div>
          )}

          <button
            className="kyc-btn primary"
            onClick={handleStartVerification}
            disabled={kycLoading}
          >
            {kycLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {t('kyc.starting') || 'Starting...'}
              </>
            ) : (
              t('kyc.startBtn') || 'Start Verification'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default KycVerification
