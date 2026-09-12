import { Routes, Route } from 'react-router-dom'
import MovieCard from './components/MovieCard'
import HallPage from './pages/HallPage'
import TicketPage from './pages/TicketPage'
import { useState } from 'react'

function App() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const getWeekDates = () => {
  const today = new Date()
  const monday = new Date(today)

  const day = monday.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1

  monday.setDate(monday.getDate() - daysFromMonday)
  monday.setDate(monday.getDate() + weekOffset * 7)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
    })
  }

  const weekDates = getWeekDates()
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <header className="page-header">
              <h1 className="page-header__title">
                Идём<span>в</span>кино
              </h1>
            </header>

            <nav className="page-nav">
              <a
                className="page-nav__day page-nav__day_next"
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setWeekOffset((current) => current - 1)
                }}
              ></a>

              {weekDates.map((date) => {
                const isToday =
                  date.toDateString() === new Date().toDateString()

                const isSelected =
                  date.toDateString() === selectedDate.toDateString()

                return (
                  <a
                    key={date.toISOString()}
                    className={`page-nav__day ${
                      isToday ? 'page-nav__day_today' : ''
                    } ${
                      isSelected ? 'page-nav__day_chosen' : ''
                    }`}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setSelectedDate(date)
                    }}
                  >
                    <span className="page-nav__day-week">
                      {date.toLocaleDateString('ru-RU', {
                        weekday: 'short',
                      }).slice(0, 2)}
                    </span>

                    <span className="page-nav__day-number">
                      {date.getDate()}
                    </span>
                  </a>
                )
              })}

              <a
                className="page-nav__day page-nav__day_next"
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setWeekOffset((current) => current + 1)
                }}
              ></a>
            </nav>

            <main>
              <MovieCard selectedDate={selectedDate} />
            </main>
          </>
        }
      />

      <Route path="/hall/:sessionId" element={<HallPage />} />
      <Route path="/ticket/:bookingCode" element={<TicketPage />} />
    </Routes>
  )
}

export default App