import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function MoviePage() {
  const { movieId } = useParams()
  const [movie, setMovie] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/movies/${movieId}/`)
      .then((response) => response.json())
      .then((data) => {
        setMovie(data)
      })
  }, [movieId])

  if (!movie) {
    return <p style={{ padding: '30px' }}>Загрузка...</p>
  }

  return (
    <main style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/">← Вернуться к фильмам</Link>

      <h1 style={{ marginTop: '30px' }}>{movie.title}</h1>

      <p>{movie.description}</p>

      <p>
        <strong>Продолжительность:</strong> {movie.duration} минут
      </p>

      <p>
        <strong>Возрастной рейтинг:</strong> {movie.age_rating}
      </p>
    </main>
  )
}

export default MoviePage