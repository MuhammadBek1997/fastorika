import { useState, useEffect, useRef } from 'react'
import { useGlobalContext } from '../Context'
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { apiFetch } from '../api'
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
    profileUserId,
    profileFirstName,
    profileLastName,
    setProfileFirstName,
    setProfileLastName,
    profilePhone,
    profileIsSelDate,
    profileCountryId,
    profileCurState,
    profileCountriesList
  } = useGlobalContext()

  const [step, setStep] = useState(() => {
    if (!kycLoading && !kycStatus && !kycAccessToken) return 'name-entry'
    return null
  })
  const [inputName, setInputName] = useState(profileFirstName || '')
  const [inputSurname, setInputSurname] = useState(profileLastName || '')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState(null)
  const [sdkLoading, setSdkLoading] = useState(false)
  const sdkContainerRef = useRef(null)
  const sdkInstanceRef = useRef(null)

  // When KYC loading finishes and there's no status, show name entry
  useEffect(() => {
    if (!kycLoading && !kycStatus && !kycAccessToken && step === null) {
      setStep('name-entry')
    }
  }, [kycLoading, kycStatus, kycAccessToken])

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

      if (!window.snsWebSdk) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js'
          script.async = true
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

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

  // Helpers
  const norm = (v) => (typeof v === 'string' ? v.trim() : (v ?? ''))
  const displayToIso = (display) => {
    if (!display) return ''
    const [d, m, y] = (display || '').split('.')
    if (!y || !m || !d) return ''
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // Handle name form next button
  const handleNameNext = () => {
    if (!inputName.trim() || !inputSurname.trim()) {
      setNameError(t('kyc.nameRequired') || 'Please enter first and last name')
      return
    }
    setNameError('')
    setStep('confirm')
  }

  // Handle confirm: save name to backend then start KYC
  const handleConfirmAndStart = async () => {
    setSaving(true)
    setError(null)
    try {
      const token = sessionStorage.getItem('token')

      let resolvedCountryId = profileCountryId
      if (!resolvedCountryId && profileCountriesList?.length) {
        const match = profileCountriesList.find(c =>
          c.name.toLowerCase() === (profileCurState || '').toLowerCase()
        )
        if (match) resolvedCountryId = match.countryId
      }

      const payload = {
        name: inputName.trim(),
        surname: inputSurname.trim(),
        phone: norm(profilePhone),
        countryId: resolvedCountryId || 0,
        dateOfBirth: displayToIso(profileIsSelDate)
      }

      const res = await apiFetch('users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || t('kyc.startError'))
        setSaving(false)
        return
      }

      setProfileFirstName(inputName.trim())
      setProfileLastName(inputSurname.trim())
      setSaving(false)
      await handleStartVerification()
    } catch (e) {
      setError(t('kyc.startError'))
      setSaving(false)
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

  // Step 1: Name entry
  if (step === 'name-entry') {
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
            <Shield size={48} className="intro-icon" />
            <h3>{t('kyc.nameEntryTitle') || 'Enter Your Passport Details'}</h3>
            <p className="kyc-passport-note">
              {t('kyc.nameEntryNote') || 'Enter data exactly as written in your passport'}
            </p>

            <div className="kyc-name-form">
              <div className="kyc-name-field">
                <label className="kyc-name-label">{t('kyc.nameLabel') || 'First Name'}</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={e => { setInputName(e.target.value); setNameError('') }}
                  placeholder={t('kyc.nameLabel') || 'First Name'}
                  className="kyc-name-input"
                />
              </div>
              <div className="kyc-name-field">
                <label className="kyc-name-label">{t('kyc.surnameLabel') || 'Last Name'}</label>
                <input
                  type="text"
                  value={inputSurname}
                  onChange={e => { setInputSurname(e.target.value); setNameError('') }}
                  placeholder={t('kyc.surnameLabel') || 'Last Name'}
                  className="kyc-name-input"
                />
              </div>
            </div>

            {nameError && (
              <div className="kyc-error-inline">
                <p>{nameError}</p>
              </div>
            )}

            <button
              className="kyc-btn primary"
              onClick={handleNameNext}
            >
              {t('kyc.nextBtn') || 'Next'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Confirm entered data
  if (step === 'confirm') {
    return (
      <div className="kyc-page" id="webSection" data-theme={theme}>
        <div className="kyc-header">
          <button className="back-btn" onClick={() => setStep('name-entry')}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('kyc.title') || 'Identity Verification'}</h2>
        </div>
        <div className="kyc-content">
          <div className="kyc-intro-card">
            <CheckCircle size={48} className="intro-icon" />
            <h3>{t('kyc.confirmTitle') || 'Confirm Your Details'}</h3>
            <p>{t('kyc.confirmNote') || 'Make sure the details match your passport exactly'}</p>

            <div className="kyc-confirm-data">
              <div className="kyc-confirm-row">
                <span className="kyc-confirm-label">{t('kyc.nameLabel') || 'First Name'}</span>
                <span className="kyc-confirm-value">{inputName}</span>
              </div>
              <div className="kyc-confirm-row">
                <span className="kyc-confirm-label">{t('kyc.surnameLabel') || 'Last Name'}</span>
                <span className="kyc-confirm-value">{inputSurname}</span>
              </div>
            </div>

            {error && (
              <div className="kyc-error-inline">
                <p>{error}</p>
              </div>
            )}

            <button
              className="kyc-btn primary"
              onClick={handleConfirmAndStart}
              disabled={saving || kycLoading}
            >
              {(saving || kycLoading) ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('kyc.saving') || 'Saving...'}
                </>
              ) : (
                t('kyc.confirmAndStart') || 'Confirm and Start Verification'
              )}
            </button>
            <button
              className="kyc-btn secondary"
              onClick={() => setStep('name-entry')}
              disabled={saving}
            >
              {t('kyc.editBtn') || 'Edit'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state or PENDING fallback
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
        <div className="kyc-loading">
          <Loader2 className="animate-spin" size={32} />
          <p>{t('kyc.loadingSDK') || 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}

export default KycVerification
