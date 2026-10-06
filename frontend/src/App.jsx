import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import MovieCard from './components/MovieCard'
import HallPage from './pages/HallPage'
import TicketPage from './pages/TicketPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import MoviePage from './pages/MoviePage'

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('adminToken')

  console.log('ProtectedAdminRoute:', token)

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/movies/')
      .then((response) => response.json())
      .then((data) => {
        setMovies(data)
      })
  }, [])
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
              <MovieCard
                movies={movies}
                selectedDate={selectedDate}
              />
            </main>
          </>
        }
      />

      <Route path="/hall/:sessionId" element={<HallPage />} />
      <Route path="/ticket/:bookingCode" element={<TicketPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/admin/login" element={<AdminLoginPage />}/>
      <Route path="/movie/:movieId" element={<MoviePage />} />
    </Routes>
  )
}

export default App