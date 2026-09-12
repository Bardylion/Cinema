function SessionList({ sessions }) {
  const halls = [
    ...new Set(sessions.map((session) => session.hall_name)),
  ]

  return (
    <>
      {halls.map((hallName) => {
        const hallSessions = sessions.filter(
          (session) => session.hall_name === hallName
        )

        if (hallSessions.length === 0) {
          return null
        }

        return (
          <div className="movie-seances__hall" key={hallName}>
            <h3 className="movie-seances__hall-title">
              {hallName}
            </h3>

            <ul className="movie-seances__list">
              {hallSessions.map((session) => {
                const isPast = new Date(session.start_time) < new Date()

                return (
                  <li
                    className="movie-seances__time-block"
                    key={session.id}
                  >
                    {isPast ? (
                      <span className="movie-seances__time movie-seances__time_disabled">
                        {new Date(session.start_time).toLocaleTimeString(
                          'ru-RU',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    ) : (
                      <a
                        className="movie-seances__time"
                        href={`/hall/${session.id}`}
                      >
                        {new Date(session.start_time).toLocaleTimeString(
                          'ru-RU',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </>
  )
}

export default SessionList