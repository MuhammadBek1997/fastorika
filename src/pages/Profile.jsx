import './profile.css'
import { useGlobalContext } from "../Context"
import { apiFetch } from "../api"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from 'react-toastify'

const Profile = () => {
  const {
    t,
    theme,
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
  } = useGlobalContext()
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

  // Helpers: name split/join and date format conversions
  const splitName = (full) => {
    const parts = (full || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0] || '';
    const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return { firstName: first, lastName: last };
  };

  const joinName = (first, last) => {
    return `${(first || '').trim()} ${(last || '').trim()}`.trim().replace(/\s+/g, ' ');
  };

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
        <div className="profile-verify">
          <div className="profile-verify-status">
            {t('profilePage.unverified')}
          </div>
          <div className="profile-verify-head">
            <img src={`/images/notverified${theme}.png`} alt="" />
            <h3>
              {t('profilePage.verifyTitle')}
            </h3>
          </div>
          <p>
            {t('profilePage.verifyDesc')}
          </p>
          <button className="verify-btn">
            {t('profilePage.verifyBtn')}
          </button>
        </div>
        <div className="profile-info">
          <h3 className="profile-info-head"></h3>
          <div className="profile-info-cont">
            <div className="profile-info-left">
              <label className="date-input-label">
                {t('profilePage.labels.firstName')}
              </label>
              <div className="date-input-container">
                <input type="text" className="date-input-field" value={profileFirstName} onChange={(e)=>setProfileFirstName(e.target.value)} />
              </div>
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
                <input type="text" className="date-input-field" value={profileLastName} onChange={(e)=>setProfileLastName(e.target.value)} />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.phone')}
              </label>
              <div className="date-input-container">
                <input type="text" className="date-input-field" value={profilePhone} onChange={(e)=>setProfilePhone(e.target.value)} />
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
            style={{
              backgroundColor: hasChanges ? '#00D796' : (theme === 'dark' ? '#363636' : '#F0F0F0'),
              cursor: hasChanges ? 'pointer' : 'not-allowed'
            }}
            onClick={async () => {
              const token = sessionStorage.getItem('token')
              if (!token) { setProfileStatus({ type: 'error', message: t('toast.authRequired') }); toast.error(t('toast.authRequired')); return; }
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

                const payload = {
                  userId: profileUserId ?? undefined,
                  name: joinName(profileFirstName, profileLastName),
                  email: norm(profileEmail),
                  phone: norm(profilePhone),
                  dateOfBirth: displayToIso(profileIsSelDate),
                  countryResponse: finalCountryId ? { countryId: finalCountryId, name: finalCountryName } : undefined,
                };

                const res = await apiFetch('user/update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                  body: JSON.stringify(payload)
                })
                const data = await res.json()
                if (!res.ok) {
                  setProfileStatus({ type: 'error', message: data.message || t('toast.profile.saveError') })
                  toast.error(data.message || t('toast.profile.saveError'))
                  return
                }
                setProfileStatus({ type: 'success', message: t('toast.profile.saveSuccess') })
                toast.success(t('toast.profile.saveSuccess'))
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
                setProfileStatus({ type: 'error', message: t('toast.networkError') })
                toast.error(t('toast.networkError'))
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