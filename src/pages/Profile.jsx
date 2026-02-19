import { useState } from 'react'
import './profile.css'
import { useGlobalContext } from "../Context"
import { apiFetch } from "../api"
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { useNotification } from '../components/Notification'

const Profile = () => {
  const {
    t,
    theme,
    navigate,
    // Profile states from global context
    profileIsSelDate, setProfileIsSelDate,
    profileIsDateOpen, setProfileIsDateOpen,
    profileCurMonth, setProfileCurMonth,
    profileIsMonthDropOpen, setProfileIsMonthDropOpen,
    profileIsYearDropOpen, setProfileIsYearDropOpen,
    profileIsStateDropOpen, setProfileIsStateDropOpen,
    profileCurState, setProfileCurState,
    profileCountryId, setProfileCountryId,
    profileBackendCountryName, setProfileBackendCountryName,
    profileUserId, setProfileUserId,
    profileCountriesList, setProfileCountriesList,
    profileFirstName, setProfileFirstName,
    profileLastName, setProfileLastName,
    profilePhone, setProfilePhone,
    profileEmail, setProfileEmail,
    profileInitial, setProfileInitial,
    profileStatus, setProfileStatus,
    // KYC
    kycStatus,
    kycLoading
  } = useGlobalContext()
  const notify = useNotification()

  // Country codes for phone input
  const countryCodes = [
    { code: '+998', country: 'UZ', flag: '🇺🇿', name: 'Uzbekistan', format: [2, 3, 2, 2], maxLen: 9 },
    { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia', format: [3, 3, 2, 2], maxLen: 10 },
    { code: '+7', country: 'KZ', flag: '🇰🇿', name: 'Kazakhstan', format: [3, 3, 2, 2], maxLen: 10 },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA', format: [3, 3, 4], maxLen: 10 },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK', format: [4, 3, 3], maxLen: 10 },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany', format: [3, 3, 4], maxLen: 10 },
    { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey', format: [3, 3, 2, 2], maxLen: 10 },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea', format: [2, 4, 4], maxLen: 10 },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China', format: [3, 4, 4], maxLen: 11 },
    { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE', format: [2, 3, 4], maxLen: 9 }
  ]

  // Format phone number with spaces based on country format pattern
  const formatPhoneDisplay = (raw, countryObj) => {
    if (!raw) return ''
    const digits = raw.replace(/\D/g, '')
    if (!countryObj?.format) return digits
    let result = ''
    let pos = 0
    for (let i = 0; i < countryObj.format.length; i++) {
      const groupLen = countryObj.format[i]
      const chunk = digits.slice(pos, pos + groupLen)
      if (!chunk) break
      if (result) result += ' '
      result += chunk
      pos += groupLen
    }
    return result
  }
  const [isPhoneCountryDropdownOpen, setIsPhoneCountryDropdownOpen] = useState(false)

  // Extract country code from phone number
  const extractCountryFromPhone = (phone) => {
    if (!phone) return countryCodes[0]
    const phoneStr = String(phone)
    for (const country of countryCodes) {
      if (phoneStr.startsWith(country.code)) {
        return country
      }
    }
    return countryCodes[0]
  }

  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(() => extractCountryFromPhone(profilePhone))

  // Get phone number without country code
  const getPhoneWithoutCode = (phone, countryCode) => {
    if (!phone) return ''
    const phoneStr = String(phone)
    if (phoneStr.startsWith(countryCode)) {
      return phoneStr.slice(countryCode.length)
    }
    return phoneStr
  }

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'April', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

  // Countries will be loaded from backend: /api/country/all

  const handleStateSelect = (stateName, stateId) => {
    setProfileCurState(stateName)
    setProfileCountryId(stateId ?? null)
    setProfileIsStateDropOpen(false)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurMonth: false,
        isWeekend: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = new Date(year, month, i).getDay();
      days.push({
        day: i,
        isCurMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurMonth: false,
        isWeekend: false
      });
    }

    return days;
  };

  const handleDateSelect = (day) => {
    const year = profileCurMonth.getFullYear();
    const month = profileCurMonth.getMonth();
    const formattedDate = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
    setProfileIsSelDate(formattedDate);
    setProfileIsDateOpen(false);
  };

  const previousMonth = () => {
    setProfileCurMonth(new Date(profileCurMonth.getFullYear(), profileCurMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setProfileCurMonth(new Date(profileCurMonth.getFullYear(), profileCurMonth.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex) => {
    setProfileCurMonth(new Date(profileCurMonth.getFullYear(), monthIndex));
    setProfileIsMonthDropOpen(false);
  };

  const handleYearSelect = (year) => {
    setProfileCurMonth(new Date(year, profileCurMonth.getMonth()));
    setProfileIsYearDropOpen(false);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const days = getDaysInMonth(profileCurMonth);

  // Helpers: date format conversions
  const isoToDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = (iso || '').split('-');
    if (!y || !m || !d) return '';
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  };

  const displayToIso = (display) => {
    if (!display) return '';
    const [d, m, y] = (display || '').split('.')
    if (!y || !m || !d) return '';
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const toLocalCountryName = (backendName) => {
    if (!backendName) return '';
    const name = String(backendName).toLowerCase();
    if (name.includes('uzbek')) return t('profilePage.countries.uzbekistan');
    if (name.includes('russ') || name.includes('russia')) return t('profilePage.countries.russia');
    return backendName;
  };

  // Profile and countries are now loaded in global context on auth

  // Lock name/surname once KYC has been initiated
  const isNameLocked = kycStatus === 'PENDING' || kycStatus === 'VERIFIED' || kycStatus === 'NOT_VERIFIED'

  const norm = (v) => (typeof v === 'string' ? v.trim() : (v ?? ''))
  const hasChanges = profileInitial ? (
    norm(profileFirstName) !== norm(profileInitial.firstName) ||
    norm(profileLastName) !== norm(profileInitial.lastName) ||
    norm(profilePhone) !== norm(profileInitial.phone) ||
    norm(profileCurState) !== norm(profileInitial.country) ||
    norm(profileIsSelDate) !== norm(profileInitial.birthDate)
  ) : false

  return (
    <div className='profile' id='webSection' data-theme={theme}>
      <div className='profile-top'>
        <h2 className='profile-head'>
          {t('profilePage.title')}
        </h2>
      </div>
      <div className='profile-body'>
        {kycStatus !== 'VERIFIED' && (
        <div className="profile-verify">
          {kycLoading ? (
            <>
              <div className="profile-verify-status loading">
                <Loader2 className="animate-spin" size={16} />
                {t('profilePage.checkingStatus') || 'Checking...'}
              </div>
            </>
          ) : kycStatus === 'PENDING' ? (
            <>
              <div className="profile-verify-status pending">
                <Clock size={16} />
                {t('profilePage.pending') || 'Pending'}
              </div>
              <div className="profile-verify-head">
                <Clock size={48} className="pending-icon" />
                <h3>{t('profilePage.pendingTitle') || 'Verification in Progress'}</h3>
              </div>
              <p>{t('profilePage.pendingDesc') || 'Your verification is being reviewed. This usually takes a few minutes.'}</p>
              <button className="verify-btn secondary" onClick={() => navigate('/kyc')}>
                {t('profilePage.checkStatus') || 'Check Status'}
              </button>
            </>
          ) : kycStatus === 'NOT_VERIFIED' ? (
            <>
              <div className="profile-verify-status not-verified">
                <XCircle size={16} />
                {t('profilePage.notVerified') || 'Not Verified'}
              </div>
              <div className="profile-verify-head">
                <XCircle size={48} className="not-verified-icon" />
                <h3>{t('profilePage.notVerifiedTitle') || 'Verification Failed'}</h3>
              </div>
              <p>{t('profilePage.notVerifiedDesc') || 'Your verification was not successful. Please try again.'}</p>
              <button className="verify-btn" onClick={() => navigate('/kyc')}>
                {t('profilePage.tryAgain') || 'Try Again'}
              </button>
            </>
          ) : (
            <>
              <div className="profile-verify-status">
                {t('profilePage.unverified')}
              </div>
              <div className="profile-verify-head">
                <img src={`/images/notverified${theme}.png`} alt="" />
                <h3>{t('profilePage.verifyTitle')}</h3>
              </div>
              <p>{t('profilePage.verifyDesc')}</p>
              <button className="verify-btn" onClick={() => navigate('/kyc')}>
                {t('profilePage.verifyBtn')}
              </button>
            </>
          )}
        </div>
        )}
        <div className="profile-info">
          <h3 className="profile-info-head"></h3>
          <div className="profile-info-cont">
            <div className="profile-info-left">
              <label className="date-input-label">
                {t('profilePage.labels.firstName')}
              </label>
              <div className="date-input-container">
                <input
                  type="text"
                  className={`date-input-field${isNameLocked ? ' field-locked' : ''}`}
                  value={profileFirstName}
                  onChange={(e) => !isNameLocked && setProfileFirstName(e.target.value)}
                  readOnly={isNameLocked}
                />
              </div>
              {isNameLocked && (
                <p className="field-locked-note">{t('profilePage.nameLocked') || 'Name is locked after verification starts'}</p>
              )}
              <label className="date-input-label">
                {t('profilePage.labels.email')}
              </label>
              <div className="date-input-container">
                <input type="text" className="date-input-field" value={profileEmail} readOnly />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.country')}
              </label>
              <div className="date-input-container" style={{ padding: "0" }}>
                <button
                  onClick={() => setProfileIsStateDropOpen(!profileIsStateDropOpen)}
                  className="country-select-btn"
                >
                  {profileCurState}
                  <ChevronRight size={16} style={{ transform: profileIsStateDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {profileIsStateDropOpen && (
                  <div className="country-dropdown-menu">
                    {profileCountriesList.map((c) => (
                      <button
                        key={c.countryId ?? c.name}
                        onClick={() => handleStateSelect(c.name, c.countryId)}
                        className={`country-option ${profileCurState === c.name ? 'active' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
            <div className="profile-info-right">
              <label className="date-input-label">
                {t('profilePage.labels.lastName')}
              </label>
              <div className="date-input-container">
                <input
                  type="text"
                  className={`date-input-field${isNameLocked ? ' field-locked' : ''}`}
                  value={profileLastName}
                  onChange={(e) => !isNameLocked && setProfileLastName(e.target.value)}
                  readOnly={isNameLocked}
                />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.phone')}
              </label>
              <div className="date-input-container phone-input-container">
                {/* Country Code Dropdown */}
                <div className="phone-country-wrapper">
                  <button
                    type="button"
                    className="phone-country-btn"
                    onClick={() => setIsPhoneCountryDropdownOpen(!isPhoneCountryDropdownOpen)}
                  >
                    <img src={`https://flagcdn.com/w40/${selectedPhoneCountry.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                    <span>{selectedPhoneCountry.code}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isPhoneCountryDropdownOpen && (
                    <div className="phone-country-dropdown">
                      {countryCodes.map((country, idx) => (
                        <button
                          key={`${country.code}-${country.country}-${idx}`}
                          type="button"
                          className={`phone-country-option ${selectedPhoneCountry.code === country.code && selectedPhoneCountry.country === country.country ? 'active' : ''}`}
                          onClick={() => {
                            const phoneWithoutCode = getPhoneWithoutCode(profilePhone, selectedPhoneCountry.code)
                            setSelectedPhoneCountry(country)
                            setProfilePhone(`${country.code}${phoneWithoutCode}`)
                            setIsPhoneCountryDropdownOpen(false)
                          }}
                        >
                          <img src={`https://flagcdn.com/w40/${country.country.toLowerCase()}.png`} alt="" style={{width:20,height:14,objectFit:'cover',borderRadius:2}} />
                          <span className="phone-country-option-name">{country.name}</span>
                          <span className="phone-country-option-code">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phone Number Input */}
                <input
                  type="text"
                  className="phone-number-input"
                  value={formatPhoneDisplay(getPhoneWithoutCode(profilePhone, selectedPhoneCountry.code), selectedPhoneCountry)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    const maxLen = selectedPhoneCountry.maxLen || 15
                    const trimmed = val.slice(0, maxLen)
                    setProfilePhone(`${selectedPhoneCountry.code}${trimmed}`)
                  }}
                  placeholder={selectedPhoneCountry.format ? selectedPhoneCountry.format.map(n => 'X'.repeat(n)).join(' ') : '901234567'}
                />
              </div>

              {/* Date Input Field */}
              <div className="date-input-wrapper">
                <label className="date-input-label">{t('profilePage.labels.date')}</label>
                <div className="date-input-container" onClick={() => setProfileIsDateOpen(!profileIsDateOpen)}>
                  <input
                    type="text"
                    value={profileIsSelDate}
                    readOnly
                    placeholder={t('profilePage.placeholders.selectDate')}
                    className="date-input-field"
                  />

                  <Calendar className="date-input-icon" />
                </div>
              </div>

              {/* Calendar Picker */}
              {profileIsDateOpen && (
                <div className="calendar-picker">
                  {/* Month Navigation */}
                  {/* Month Navigation */}
                  <div className="calendar-header">
                    <div className="calendar-month-year-selector">
                      <div className="month-dropdown">
                        <button
                          onClick={() => setProfileIsMonthDropOpen(!profileIsMonthDropOpen)}
                          className="month-year-btn"
                        >
                          {months[profileCurMonth.getMonth()]}
                          <ChevronRight size={16} style={{ transform: profileIsMonthDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {profileIsMonthDropOpen && (
                          <div className="month-dropdown-menu">
                            {months.map((month, index) => (
                              <button
                                key={index}
                                onClick={() => handleMonthSelect(index)}
                                className={`month-option ${profileCurMonth.getMonth() === index ? 'active' : ''}`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="year-dropdown">
                        <button
                          onClick={() => setProfileIsYearDropOpen(!profileIsYearDropOpen)}
                          className="month-year-btn"
                        >
                          {profileCurMonth.getFullYear()}
                          <ChevronRight size={16} style={{ transform: profileIsYearDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {profileIsYearDropOpen && (
                          <div className="year-dropdown-menu">
                            {generateYearRange().map((year) => (
                              <button
                                key={year}
                                onClick={() => handleYearSelect(year)}
                                className={`year-option ${profileCurMonth.getFullYear() === year ? 'active' : ''}`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex">
                      <button onClick={previousMonth} className="calendar-nav-btn">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextMonth} className="calendar-nav-btn">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Week Days */}
                  <div className="calendar-weekdays">
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`calendar-weekday ${index >= 5 ? 'weekend' : 'weekday'}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="calendar-days-grid">
                    {days.map((dayObj, index) => {
                      const isSelected = dayObj.isCurMonth && profileIsSelDate === `${String(dayObj.day).padStart(2, '0')}.${String(profileCurMonth.getMonth() + 1).padStart(2, '0')}.${profileCurMonth.getFullYear()}`;

                      let btnClass = 'calendar-day-btn';
                      if (!dayObj.isCurMonth) {
                        btnClass += ' not-current-month';
                      } else {
                        btnClass += ' current-month';
                        if (isSelected) btnClass += ' selected';
                        if (dayObj.isWeekend) btnClass += ' weekend';
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => dayObj.isCurMonth && handleDateSelect(dayObj.day)}
                          disabled={!dayObj.isCurMonth}
                          className={btnClass}
                        >
                          {dayObj.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            className="save-btn"
            disabled={!hasChanges}
            onClick={async () => {
              const token = sessionStorage.getItem('token')
              if (!token) { setProfileStatus({ type: 'error', message: t('notify.authRequired') }); notify.error(t('notify.authRequired')); return; }
              if (!hasChanges) { return; }
              try {
                // Resolve country id/name for backend
                const uiCountry = (profileCurState || '').toLowerCase();
                let resolvedCountryId = profileCountryId;
                if (!resolvedCountryId && profileCountriesList.length) {
                  const match = profileCountriesList.find(c => c.name.toLowerCase() === uiCountry)
                  if (match) resolvedCountryId = match.countryId;
                }

                const countryNameFromId = (id) => {
                  const found = profileCountriesList.find(c => c.countryId === id)
                  if (found) return found.name
                  return profileBackendCountryName || profileCurState || ''
                };

                const finalCountryId = resolvedCountryId ?? profileCountryId ?? null;
                const finalCountryName = countryNameFromId(finalCountryId);

                // Backend expects: { name, surname, phone, countryId, dateOfBirth }
                const payload = {
                  name: norm(profileFirstName),
                  surname: norm(profileLastName),
                  phone: norm(profilePhone),
                  countryId: finalCountryId || 0,
                  dateOfBirth: displayToIso(profileIsSelDate)
                };

                const res = await apiFetch('users/me', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                  body: JSON.stringify(payload)
                })
                const responseData = await res.json()
                if (!res.ok) {
                  setProfileStatus({ type: 'error', message: responseData.message || t('notify.profile.saveError') })
                  notify.error(responseData.message || t('notify.profile.saveError'))
                  return
                }
                setProfileStatus({ type: 'success', message: t('notify.profile.saveSuccess') })
                notify.success(t('notify.profile.saveSuccess'))
                // update baseline after successful save
                setProfileInitial({
                  email: profileEmail,
                  firstName: norm(profileFirstName),
                  lastName: norm(profileLastName),
                  phone: norm(profilePhone),
                  country: norm(profileCurState),
                  birthDate: norm(profileIsSelDate),
                  countryId: resolvedCountryId ?? null
                })
              } catch (e) {
                setProfileStatus({ type: 'error', message: t('notify.networkError') })
                notify.error(t('notify.networkError'))
              }
            }}
          >
            {t('profilePage.saveBtn') || 'Saqlash'}
          </button>
          {profileStatus.type && (
            <div className={`status-msg ${profileStatus.type}`}>{profileStatus.message}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile