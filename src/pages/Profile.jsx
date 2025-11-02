import { useEffect, useState } from "react"
import { useGlobalContext } from "../Context"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const Profile = () => {
  let { t, theme } = useGlobalContext()
  let date = new Date()
  const [isSelDate, setIsSelDate] = useState('')
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [curMonth, setCurMonth] = useState(new Date(date.getFullYear(), date.getMonth()))
  const [number, setNumber] = useState("")
  const [isMonthDropOpen, setIsMonthDropOpen] = useState(false)
  const [isYearDropOpen, setIsYearDropOpen] = useState(false)
  const [isStateDropOpen, setIsStateDropOpen] = useState(false)
  const [curState, setCurState] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'April', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

  const countries = [
    t('profilePage.countries.uzbekistan'),
    t('profilePage.countries.russia')
  ]

  const handleStateSelect = (state) => {
    setCurState(state)
    setIsStateDropOpen(false)
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
    const year = curMonth.getFullYear();
    const month = curMonth.getMonth();
    const formattedDate = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
    setIsSelDate(formattedDate);
    setIsDateOpen(false);
  };

  const previousMonth = () => {
    setCurMonth(new Date(curMonth.getFullYear(), curMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurMonth(new Date(curMonth.getFullYear(), curMonth.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex) => {
    setCurMonth(new Date(curMonth.getFullYear(), monthIndex));
    setIsMonthDropOpen(false);
  };

  const handleYearSelect = (year) => {
    setCurMonth(new Date(year, curMonth.getMonth()));
    setIsYearDropOpen(false);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const days = getDaysInMonth(curMonth);

  // Load profile info
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: { Authorization: 'Bearer ' + token }
        })
        const data = await res.json()
        if (!res.ok) {
          console.warn('Profile load failed:', data.message)
          return
        }
        setEmail(data.email || '')
        setFirstName(data.firstName || '')
        setLastName(data.lastName || '')
        setPhone(data.phone || '')
        setCurState(data.country || '')
        setIsSelDate(data.birthDate || '')
      } catch (e) {
        console.warn('Profile load network error')
      }
    })()
  }, [])

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
                <input type="text" className="date-input-field" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.email')}
              </label>
              <div className="date-input-container">
                <input type="text" className="date-input-field" value={email} readOnly />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.country')}
              </label>
              <div className="date-input-container" style={{ padding: "0" }}>
                <button
                  onClick={() => setIsStateDropOpen(!isStateDropOpen)}
                  className="country-select-btn"
                >
                  {curState}
                  <ChevronRight size={16} style={{ transform: isStateDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {isStateDropOpen && (
                  <div className="country-dropdown-menu">
                    {countries.map((state, index) => (
                      <button
                        key={index}
                        onClick={() => handleStateSelect(state)}
                        className={`country-option ${curState === state ? 'active' : ''}`}
                      >
                        {state}
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
                <input type="text" className="date-input-field" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
              </div>
              <label className="date-input-label">
                {t('profilePage.labels.phone')}
              </label>
              <div className="date-input-container">
                <input type="text" className="date-input-field" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              </div>

              {/* Date Input Field */}
              <div className="date-input-wrapper">
                <label className="date-input-label">{t('profilePage.labels.date')}</label>
                <div className="date-input-container" onClick={() => setIsDateOpen(!isDateOpen)}>
                  <input
                    type="text"
                    value={isSelDate}
                    readOnly
                    placeholder={t('profilePage.placeholders.selectDate')}
                    className="date-input-field"
                  />

                  <Calendar className="date-input-icon" />
                </div>
              </div>

              {/* Calendar Picker */}
              {isDateOpen && (
                <div className="calendar-picker">
                  {/* Month Navigation */}
                  {/* Month Navigation */}
                  <div className="calendar-header">
                    <div className="calendar-month-year-selector">
                      <div className="month-dropdown">
                        <button
                          onClick={() => setIsMonthDropOpen(!isMonthDropOpen)}
                          className="month-year-btn"
                        >
                          {months[curMonth.getMonth()]}
                          <ChevronRight size={16} style={{ transform: isMonthDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {isMonthDropOpen && (
                          <div className="month-dropdown-menu">
                            {months.map((month, index) => (
                              <button
                                key={index}
                                onClick={() => handleMonthSelect(index)}
                                className={`month-option ${curMonth.getMonth() === index ? 'active' : ''}`}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="year-dropdown">
                        <button
                          onClick={() => setIsYearDropOpen(!isYearDropOpen)}
                          className="month-year-btn"
                        >
                          {curMonth.getFullYear()}
                          <ChevronRight size={16} style={{ transform: isYearDropOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </button>
                        {isYearDropOpen && (
                          <div className="year-dropdown-menu">
                            {generateYearRange().map((year) => (
                              <button
                                key={year}
                                onClick={() => handleYearSelect(year)}
                                className={`year-option ${curMonth.getFullYear() === year ? 'active' : ''}`}
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
                      const isSelected = dayObj.isCurMonth && isSelDate === `${String(dayObj.day).padStart(2, '0')}.${String(curMonth.getMonth() + 1).padStart(2, '0')}.${curMonth.getFullYear()}`;

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
            onClick={async () => {
              const token = localStorage.getItem('token')
              if (!token) { alert('Avval login qiling'); return; }
              try {
                const res = await fetch('/api/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                  body: JSON.stringify({ firstName, lastName, phone, country: curState, birthDate: isSelDate })
                })
                const data = await res.json()
                if (!res.ok) {
                  alert(data.message || 'Saqlash xatosi')
                  return
                }
                alert('Profil saqlandi')
              } catch (e) {
                alert('Tarmoq xatosi')
              }
            }}
          >
            {t('profilePage.saveBtn') || 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile