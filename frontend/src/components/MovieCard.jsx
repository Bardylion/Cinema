import { useEffect, useState } from 'react'
import SessionList from './SessionList'

function MovieCard({ movies, selectedDate }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sessions/')
      .then((response) => response.json())
      .then((data) => {
        setSessions(data)
      })
  }, [])

  return (
    <>
      {movies.map((movie) => {
        const filteredSessions = sessions.filter((session) => {
          const sessionDate = new Date(session.start_time)

          return (
            session.movie === movie.id &&
            sessionDate.toDateString() === selectedDate.toDateString()
          )
        })

        if (filteredSessions.length === 0) {
          return null
        }

        return (
          <section className="movie" key={movie.id}>
            <div className="movie__info">
              <div className="movie__poster">
                <img
                  className="movie__poster-image"
                  src="/client/i/poster1.jpg"
                  alt="Постер фильма"
                />
              </div>

              <div className="movie__description">
                <h2 className="movie__title">
                  {movie.title}
                </h2>

                <p className="movie__synopsis">
                  {movie.description}
                </p>

                <p className="movie__data">
                  <span className="movie__data-duration">
                    {movie.duration} минут
                  </span>
                </p>
              </div>
            </div>

            <SessionList sessions={filteredSessions} />
          </section>
        )
      })}
    </>
  )
}

export default MovieCard