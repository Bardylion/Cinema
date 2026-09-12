import { useEffect, useState } from 'react'
import SessionList from './SessionList'

function MovieCard({ selectedDate }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sessions/')
      .then((response) => response.json())
      .then((data) => {
        setSessions(data)
      })
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.start_time)

    return sessionDate.toDateString() === selectedDate.toDateString()
  })

  if (filteredSessions.length === 0) {
    return null
  }

  return (
    <section className="movie">
      <div className="movie__info">
        <div className="movie__poster">
          <img
            className="movie__poster-image"
            src="/client/i/poster1.jpg"
            alt="Постер фильма"
          />
        </div>

        <div className="movie__description">
          <h2 className="movie__title">Интерстеллар</h2>

          <p className="movie__synopsis">
            Фильм о путешествии исследователей через червоточину
            в космосе в поисках нового дома для человечества.
          </p>

          <p className="movie__data">
            <span className="movie__data-duration">169 минут</span>
            <span className="movie__data-origin">США</span>
          </p>
        </div>
      </div>

      <SessionList sessions={filteredSessions} />
    </section>
  )
}

export default MovieCard