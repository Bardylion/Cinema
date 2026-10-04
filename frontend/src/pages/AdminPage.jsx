import { useEffect, useState } from 'react'

function AdminPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [movies, setMovies] = useState([])
  const [isMovieFormOpen, setIsMovieFormOpen] = useState(false)
  const [editingMovieId, setEditingMovieId] = useState(null)
  const [movieTitle, setMovieTitle] = useState('')
  const [movieDescription, setMovieDescription] = useState('')
  const [movieDuration, setMovieDuration] = useState('')
  const [movieAgeRating, setMovieAgeRating] = useState('')
  const [sessions, setSessions] = useState([])
  const [isAddingSession, setIsAddingSession] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [sessionMovieId, setSessionMovieId] = useState('')
  const [sessionHallId, setSessionHallId] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [sessionPrice, setSessionPrice] = useState('')
  const token = localStorage.getItem('adminToken')
  const [halls, setHalls] = useState([])
  const [isCreatingHall, setIsCreatingHall] = useState(false)
  const [hallName, setHallName] = useState('')
  const [hallRows, setHallRows] = useState('')
  const [hallSeats, setHallSeats] = useState('')
  const [selectedHallId, setSelectedHallId] = useState('')
  const [selectedPriceHallId, setSelectedPriceHallId] = useState('')
  const [standardPrice, setStandardPrice] = useState('')
  const [vipPrice, setVipPrice] = useState('')
  const [seats, setSeats] = useState([])
  const [openSteps, setOpenSteps] = useState([0, 1, 2, 3, 4])
  const [changedSeats, setChangedSeats] = useState({})
  

  /**
   * Переключает тип кресла по кругу: NORMAL -> VIP -> DISABLED -> NORMAL.
   */
  const toggleSeatType = (seatId) => {
    setSeats((currentSeats) =>
      currentSeats.map((seat) => {
        if (seat.id !== seatId) {
          return seat
        }

        let nextType = 'NORMAL'

        if (seat.seat_type === 'NORMAL') {
          nextType = 'VIP'
        } else if (seat.seat_type === 'VIP') {
          nextType = 'DISABLED'
        }

        return {
          ...seat,
          seat_type: nextType,
        }
      })
    )

    setChangedSeats((current) => {
      const seat = seats.find((item) => item.id === seatId)

      if (!seat) {
        return current
      }

      let nextType = 'NORMAL'

      if (seat.seat_type === 'NORMAL') {
        nextType = 'VIP'
      } else if (seat.seat_type === 'VIP') {
        nextType = 'DISABLED'
      }

      return {
        ...current,
        [seatId]: nextType,
      }
    })
  }

  // Загружаем список залов.
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/halls/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setHalls(data)
      })
  }, [])

  // Загружаем список сеансов.
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sessions/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSessions(data)
      })
  }, [])

  // После загрузки залов выбираем первый зал по умолчанию
  useEffect(() => {
    if (halls.length === 0) {
      return
    }

    setSelectedHallId(halls[0].id)
    setSelectedPriceHallId(halls[0].id)
  }, [halls])

  // При смене выбранного зала (для конфигурации кресел) загружаем его
  // кресла. Если зал не выбран — очищаем список кресел.
  useEffect(() => {
    if (!selectedHallId) {
      setSeats([])
      return
    }

    fetch(`http://127.0.0.1:8000/api/seats/?hall=${selectedHallId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSeats(data)
      })
  }, [selectedHallId])

  // При смене выбранного зала (для конфигурации цен) заполняем поля
  // стандартной и VIP цены текущими значениями этого зала.
  useEffect(() => {
    if (!selectedPriceHallId) {
      setStandardPrice('')
      setVipPrice('')
      return
    }

    const selectedHall = halls.find(
      (hall) => hall.id === Number(selectedPriceHallId)
    )

    if (selectedHall) {
      setStandardPrice(selectedHall.standard_price)
      setVipPrice(selectedHall.vip_price)
    }
  }, [selectedPriceHallId, halls])

  // Загружаем список фильмов.
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/movies/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMovies(data)
      })
  }, [])

  // Подключаем стили админ-панели в <head>
  useEffect(() => {
    const normalize = document.createElement('link')
    normalize.rel = 'stylesheet'
    normalize.href = '/admin/css/normalize.css'

    const styles = document.createElement('link')
    styles.rel = 'stylesheet'
    styles.href = '/admin/css/styles.css'

    document.head.appendChild(normalize)
    document.head.appendChild(styles)

    return () => {
      document.head.removeChild(normalize)
      document.head.removeChild(styles)
    }
  }, [])
  const openMovieEditor = (movie) => {
    setEditingMovieId(movie.id)
    setMovieTitle(movie.title)
    setMovieDescription(movie.description)
    setMovieDuration(String(movie.duration))
    setMovieAgeRating(movie.age_rating)
    setIsMovieFormOpen(true)
  }

  const resetMovieForm = () => {
    setIsMovieFormOpen(false)
    setEditingMovieId(null)
    setMovieTitle('')
    setMovieDescription('')
    setMovieDuration('')
    setMovieAgeRating('')
  }
  const deleteMovie = async () => {
    if (!editingMovieId) {
      return
    }

    const confirmed = window.confirm(
      'Удалить фильм? Связанные с ним сеансы тоже будут удалены.'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/movies/${editingMovieId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Не удалось удалить фильм')
      }

      setMovies((currentMovies) =>
        currentMovies.filter((movie) => movie.id !== editingMovieId)
      )

      setSessions((currentSessions) =>
        currentSessions.filter((session) => session.movie !== editingMovieId)
      )

      resetMovieForm()
    } catch (error) {
      console.error(error)
      alert('Не удалось удалить фильм')
    }
  }
  const saveMovie = async () => {
  if (
    !movieTitle ||
    !movieDescription ||
    !movieDuration ||
    !movieAgeRating
  ) {return}

  const movieData = {
    title: movieTitle,
    description: movieDescription,
    duration: Number(movieDuration),
    age_rating: movieAgeRating,
  }

  try {
    const url = editingMovieId
      ? `http://127.0.0.1:8000/api/movies/${editingMovieId}/`
      : 'http://127.0.0.1:8000/api/movies/'

    const response = await fetch(url, {
      method: editingMovieId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(movieData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return
    }

    if (editingMovieId) {
      setMovies((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === data.id ? data : movie
        )
      )
    } else {
      setMovies((currentMovies) => [...currentMovies, data])
    }

    resetMovieForm()
  } catch (error) {
    console.error(error)
    }
  }
  const saveSeatChanges = async () => {
    try {
      const seatIds = Object.keys(changedSeats)

      for (const seatId of seatIds) {
        const response = await fetch(
          `http://127.0.0.1:8000/api/seats/${seatId}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              seat_type: changedSeats[seatId],
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Не удалось сохранить изменения.')
        }
      }

      setChangedSeats({})
    } catch (error) {
      console.error(error)
    }
  }

  // аккордеон
  const toggleStep = (index) => {
    setOpenSteps((current) => {
      if (current.includes(index)) {
        return current.filter((step) => step !== index)
      }

      return [...current, index]
    })
  }

  /**
   * Сохраняет стандартную и VIP цены для выбранного зала PATCH-запросом,
   * а затем обновляет запись этого зала в локальном состоянии данными,
   * полученными от сервера.
   */
  const saveHallPrices = async () => {
    if (!selectedPriceHallId) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/halls/${selectedPriceHallId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            standard_price: Number(standardPrice),
            vip_price: Number(vipPrice),
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Не удалось сохранить цены.')
      }

      const updatedHall = await response.json()

      setHalls((currentHalls) =>
        currentHalls.map((hall) =>
          hall.id === updatedHall.id ? updatedHall : hall
        )
      )
    } catch (error) {
      console.error(error)
    }
  }
  const openSessionEditor = (session) => {
    const startDate = new Date(session.start_time)

    const year = startDate.getFullYear()
    const month = String(startDate.getMonth() + 1).padStart(2, '0')
    const day = String(startDate.getDate()).padStart(2, '0')

    const hours = String(startDate.getHours()).padStart(2, '0')
    const minutes = String(startDate.getMinutes()).padStart(2, '0')

    setEditingSessionId(session.id)
    setSessionMovieId(String(session.movie))
    setSessionHallId(String(session.hall))
    setSelectedDate(`${year}-${month}-${day}`)
    setSessionTime(`${hours}:${minutes}`)
    setSessionPrice(String(session.base_price || ''))

    setIsAddingSession(true)
  }

  const deleteSession = async () => {
  if (!editingSessionId) {
    return
  }

  const confirmed = window.confirm('Удалить этот сеанс?')

  if (!confirmed) {
    return
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/sessions/${editingSessionId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Не удалось удалить сеанс')
    }

    setSessions((currentSessions) =>
      currentSessions.filter(
        (session) => session.id !== editingSessionId
      )
    )

    setEditingSessionId(null)
    setIsAddingSession(false)
    setSessionMovieId('')
    setSessionHallId('')
    setSessionTime('')
    setSessionPrice('')
  } catch (error) {
    console.error(error)
    alert('Не удалось удалить сеанс')
    }
  }
const saveSession = async () => {
  if (!sessionMovieId || !sessionHallId || !selectedDate || !sessionTime) {
    return
  }

  try {
    const sessionData = {
      movie: Number(sessionMovieId),
      hall: Number(sessionHallId),
      start_time: `${selectedDate}T${sessionTime}:00+03:00`,
      base_price: Number(sessionPrice || 0),
    }

    const url = editingSessionId
      ? `http://127.0.0.1:8000/api/sessions/${editingSessionId}/`
      : 'http://127.0.0.1:8000/api/sessions/'

    const response = await fetch(url, {
      method: editingSessionId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(sessionData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return
    }

    if (editingSessionId) {
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === data.id ? data : session
        )
      )
    } else {
      setSessions((currentSessions) => [...currentSessions, data])
    }

    setIsAddingSession(false)
    setEditingSessionId(null)
    setSessionMovieId('')
    setSessionHallId('')
    setSessionTime('')
    setSessionPrice('')
  } catch (error) {
    console.error(error)
    }
  }

  // Сеансы на выбранный день в календаре.
  const sessionsForSelectedDate = sessions.filter((session) => {
    const sessionDate = new Date(session.start_time).toLocaleDateString('en-CA')

    return sessionDate === selectedDate
  })

  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title">
          Идём<span>в</span>кино
        </h1>

        <span className="page-header__subtitle">
          Администраторррская
        </span>
      </header>

      <main className="conf-steps">
        {/* Шаг 0: список залов + форма создания зала */}
        <section className="conf-step">
          <header
            className={`conf-step__header ${
              openSteps.includes(0)
                ? 'conf-step__header_opened'
                : 'conf-step__header_closed'
            }`}
            onClick={() => toggleStep(0)}
          >
            <h2 className="conf-step__title">
              Управление залами
            </h2>
          </header>

          <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">
              Доступные залы:
            </p>

            <ul className="conf-step__list">
              {halls.map((hall) => (
                <li key={hall.id}>
                  {hall.name}
                  <button
                    className="conf-step__button conf-step__button-trash"
                    onClick={() => {
                      fetch(`http://127.0.0.1:8000/api/halls/${hall.id}/`, {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Token ${token}`,
                        },
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error('Не удалось удалить зал.')
                          }

                          setHalls((currentHalls) =>
                            currentHalls.filter(
                              (currentHall) => currentHall.id !== hall.id
                            )
                          )
                        })
                        .catch((error) => {
                          console.error(error)
                        })
                    }}
                  ></button>
                </li>
              ))}
            </ul>

            {isCreatingHall ? (
              <div className="conf-step__legend">
                <label className="conf-step__label">
                  Название зала
                  <input
                    type="text"
                    className="conf-step__input"
                    placeholder="Зал 3"
                    value={hallName}
                    onChange={(event) => {
                      setHallName(event.target.value)
                    }}
                  />
                </label>

                <label className="conf-step__label">
                  Рядов, шт
                  <input
                    type="number"
                    className="conf-step__input"
                    placeholder="10"
                    value={hallRows}
                    onChange={(event) => {
                      setHallRows(event.target.value)
                    }}
                  />
                </label>

                <label className="conf-step__label">
                  Мест, шт
                  <input
                    type="number"
                    className="conf-step__input"
                    placeholder="8"
                    value={hallSeats}
                    onChange={(event) => {
                      setHallSeats(event.target.value)
                    }}
                  />
                </label>

                <button
                  type="button"
                  className="conf-step__button conf-step__button-accent"
                  onClick={() => {
                    fetch('http://127.0.0.1:8000/api/halls/', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                      },
                      body: JSON.stringify({
                        name: hallName,
                        rows: Number(hallRows),
                        seats_per_row: Number(hallSeats),
                        standard_price: 0,
                        vip_price: 0,
                      }),
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        console.log(data)
                        setHalls((currentHalls) => [...currentHalls, data])
                        setHallName('')
                        setHallRows('')
                        setHallSeats('')
                        setIsCreatingHall(false)
                      })
                  }}
                >
                  Сохранить
                </button>

                <button
                  type="button"
                  className="conf-step__button conf-step__button-regular"
                  onClick={() => {
                    setIsCreatingHall(false)
                    setHallName('')
                    setHallRows('')
                    setHallSeats('')
                  }}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="conf-step__button conf-step__button-accent"
                onClick={() => {
                  setIsCreatingHall(true)
                }}
              >
                Создать зал
              </button>
            )}
          </div>
        </section>

        {/* Шаг 1: конфигурация схемы кресел для выбранного зала */}
        <section className="conf-step">
          <header
            className={`conf-step__header ${
              openSteps.includes(1)
                ? 'conf-step__header_opened'
                : 'conf-step__header_closed'
            }`}
            onClick={() => toggleStep(1)}
          >
            <h2 className="conf-step__title">
              Конфигурация залов
            </h2>
          </header>

          <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">
              Выберите зал для конфигурации:
            </p>

            <ul className="conf-step__selectors-box">
              {halls.map((hall) => (
                <li key={hall.id}>
                  <input
                    type="radio"
                    className="conf-step__radio"
                    name="chairs-hall"
                    value={hall.id}
                    checked={String(selectedHallId) === String(hall.id)}
                    onChange={() => setSelectedHallId(hall.id)}
                  />

                  <span className="conf-step__selector">
                    {hall.name}
                  </span>
                </li>
              ))}
            </ul>

            <p className="conf-step__paragraph">
              Укажите количество рядов и максимальное количество кресел в ряду:
            </p>

            <div className="conf-step__legend">
              <label className="conf-step__label">
                Рядов, шт
                <input
                  type="text"
                  className="conf-step__input"
                  placeholder="10"
                />
              </label>

              <span className="multiplier">
                x
              </span>

              <label className="conf-step__label">
                Мест, шт
                <input
                  type="text"
                  className="conf-step__input"
                  placeholder="8"
                />
              </label>
            </div>

            <p className="conf-step__paragraph">
              Теперь вы можете указать типы кресел на схеме зала:
            </p>

            <div className="conf-step__legend">
              <span className="conf-step__chair conf-step__chair_standart"></span>
              {' '}— обычные кресла

              <span className="conf-step__chair conf-step__chair_vip"></span>
              {' '}— VIP кресла

              <span className="conf-step__chair conf-step__chair_disabled"></span>
              {' '}— заблокированные (нет кресла)

              <p className="conf-step__hint">
                Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши
              </p>
            </div>

            <div className="conf-step__hall">
              <div className="conf-step__hall-wrapper">
                <div className="conf-step__hall-screen">
                  ЭКРАН
                </div>

                {selectedHallId &&
                  Array.from({
                    length:
                      halls.find((hall) => hall.id === Number(selectedHallId))
                        ?.rows || 0,
                  }).map((_, rowIndex) => {
                    const rowNumber = rowIndex + 1

                    return (
                      <div className="conf-step__row" key={rowNumber}>
                        {seats
                          .filter((seat) => seat.row === rowNumber)
                          .map((seat) => (
                            <span
                              className={`conf-step__chair ${
                                seat.seat_type === 'VIP'
                                  ? 'conf-step__chair_vip'
                                  : seat.seat_type === 'DISABLED'
                                    ? 'conf-step__chair_disabled'
                                    : 'conf-step__chair_standart'
                              }`}
                              key={seat.id}
                              onClick={() => toggleSeatType(seat.id)}
                            ></span>
                          ))}
                      </div>
                    )
                  })}
              </div>
            </div>

            <fieldset className="conf-step__buttons text-center">
              <button className="conf-step__button conf-step__button-regular">
                Отмена
              </button>
              <button
                type="button"
                className="conf-step__button conf-step__button-accent"
                onClick={saveSeatChanges}
              >
                Сохранить
              </button>
            </fieldset>
          </div>
        </section>

        {/* Шаг 2: конфигурация цен (стандарт/VIP) для выбранного зала */}
        <section className="conf-step">
          <header
            className={`conf-step__header ${
              openSteps.includes(2)
                ? 'conf-step__header_opened'
                : 'conf-step__header_closed'
            }`}
            onClick={() => toggleStep(2)}
          >
            <h2 className="conf-step__title">
              Конфигурация цен
            </h2>
          </header>

          <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">
              Выберите зал для конфигурации:
            </p>

            <ul className="conf-step__selectors-box">
              {halls.map((hall) => (
                <li key={hall.id}>
                  <input
                    type="radio"
                    className="conf-step__radio"
                    name="prices-hall"
                    value={hall.id}
                    checked={String(selectedPriceHallId) === String(hall.id)}
                    onChange={() => setSelectedPriceHallId(hall.id)}
                  />

                  <span className="conf-step__selector">
                    {hall.name}
                  </span>
                </li>
              ))}
            </ul>

            <p className="conf-step__paragraph">
              Установите цены для типов кресел:
            </p>

            <div className="conf-step__legend">
              <label className="conf-step__label">
                Цена, рублей
                <input
                  type="text"
                  className="conf-step__input"
                  placeholder="0"
                  value={standardPrice}
                  onChange={(event) => setStandardPrice(event.target.value)}
                />
              </label>

              за{' '}
              <span className="conf-step__chair conf-step__chair_standart"></span>
              {' '}обычные кресла
            </div>

            <div className="conf-step__legend">
              <label className="conf-step__label">
                Цена, рублей
                <input
                  type="text"
                  className="conf-step__input"
                  placeholder="0"
                  value={vipPrice}
                  onChange={(event) => setVipPrice(event.target.value)}
                />
              </label>

              за{' '}
              <span className="conf-step__chair conf-step__chair_vip"></span>
              {' '}VIP кресла
            </div>

            <fieldset className="conf-step__buttons text-center">
              <button
                type="button"
                className="conf-step__button conf-step__button-regular"
                onClick={() => {
                  const selectedHall = halls.find(
                    (hall) => hall.id === Number(selectedPriceHallId)
                  )

                  if (selectedHall) {
                    setStandardPrice(selectedHall.standard_price)
                    setVipPrice(selectedHall.vip_price)
                  }
                }}
              >
                Отмена
              </button>

              <button
                type="button"
                className="conf-step__button conf-step__button-accent"
                onClick={saveHallPrices}
              >
                Сохранить
              </button>
            </fieldset>
          </div>
        </section>

        {/* Шаг 3: сетка сеансов + форма добавления сеанса */}
        <section className="conf-step">
          <header
            className={`conf-step__header ${
              openSteps.includes(3)
                ? 'conf-step__header_opened'
                : 'conf-step__header_closed'
            }`}
            onClick={() => toggleStep(3)}
          >
            <h2 className="conf-step__title">
              Сетка сеансов
            </h2>
          </header>

          <div className="conf-step__wrapper">
            <p className="conf-step__paragraph">
              Выберите день:
              <input
                type="date"
                className="conf-step__input"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </p>

            <p className="conf-step__paragraph">
              <button
                type="button"
                className="conf-step__button conf-step__button-accent"
                onClick={() => {
                  resetMovieForm()
                  setIsMovieFormOpen(true)
                }}
              >
                Добавить фильм
              </button>

              {' '}

              <button
                type="button"
                className="conf-step__button conf-step__button-accent"
                onClick={() => {
                  setEditingSessionId(null)
                  setSessionMovieId('')
                  setSessionHallId('')
                  setSessionTime('')
                  setSessionPrice('')
                  setIsAddingSession(true)
                }}
              >
                Добавить сеанс
              </button>
            </p>

            {isMovieFormOpen && (
              <div className="movie-form">
                <div className="movie-form__field">
                  <label className="movie-form__label">
                    Название фильма
                  </label>

                  <input
                    type="text"
                    className="movie-form__input"
                    placeholder="Например, Интерстеллар"
                    value={movieTitle}
                    onChange={(event) => setMovieTitle(event.target.value)}
                  />
                </div>

                <div className="movie-form__field movie-form__field_full">
                  <label className="movie-form__label">
                    Описание
                  </label>

                  <textarea
                    className="movie-form__textarea"
                    placeholder="Краткое описание фильма"
                    value={movieDescription}
                    onChange={(event) => setMovieDescription(event.target.value)}
                  />
                </div>

                <div className="movie-form__row">
                  <div className="movie-form__field">
                    <label className="movie-form__label">
                      Длительность
                    </label>

                    <div className="movie-form__input-wrapper">
                      <input
                        type="number"
                        className="movie-form__input"
                        placeholder="120"
                        min="1"
                        value={movieDuration}
                        onChange={(event) => setMovieDuration(event.target.value)}
                      />

                      <span className="movie-form__unit">
                        мин.
                      </span>
                    </div>
                  </div>

                  <div className="movie-form__field">
                    <label className="movie-form__label">
                      Возрастной рейтинг
                    </label>

                    <input
                      type="text"
                      className="movie-form__input"
                      placeholder="12+"
                      value={movieAgeRating}
                      onChange={(event) => setMovieAgeRating(event.target.value)}
                    />
                  </div>
                </div>

                <div className="movie-form__buttons">
                  <button
                    type="button"
                    className="conf-step__button conf-step__button-regular"
                    onClick={resetMovieForm}
                  >
                    Отмена
                  </button>

                  <button
                    type="button"
                    className="conf-step__button conf-step__button-accent"
                    onClick={saveMovie}
                  >
                    Сохранить
                  </button>
                    {editingMovieId && (
                      <button
                        type="button"
                        className="conf-step__button movie-form__delete-button"
                        onClick={deleteMovie}
                      >
                        Удалить фильм
                      </button>
                    )}
                </div>
              </div>
            )}
            
            {isAddingSession && (
              <div className="conf-step__legend">
                <label className="conf-step__label">
                  Фильм
                  <select
                    className="conf-step__input"
                    value={sessionMovieId}
                    onChange={(event) => setSessionMovieId(event.target.value)}
                  >
                    <option value="">Выберите фильм</option>

                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="conf-step__label">
                  Зал
                  <select
                    className="conf-step__input"
                    value={sessionHallId}
                    onChange={(event) => setSessionHallId(event.target.value)}
                  >
                    <option value="">Выберите зал</option>

                    {halls.map((hall) => (
                      <option key={hall.id} value={hall.id}>
                        {hall.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="conf-step__label">
                  Дата
                  <input
                    type="date"
                    className="conf-step__input"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </label>

                <label className="conf-step__label">
                  Время
                  <input
                    type="time"
                    className="conf-step__input"
                    value={sessionTime}
                    onChange={(event) => setSessionTime(event.target.value)}
                  />
                </label>

                <fieldset className="conf-step__buttons text-center">
                  <button
                    type="button"
                    className="conf-step__button conf-step__button-regular"
                    onClick={() => {
                      setIsAddingSession(false)
                      setEditingSessionId(null)
                      setSessionMovieId('')
                      setSessionHallId('')
                      setSessionTime('')
                      setSessionPrice('')
                    }}
                  >
                    Отмена
                  </button>

                  <button
                    type="button"
                    className="conf-step__button conf-step__button-accent"
                    onClick={saveSession}
                  >
                    Сохранить
                  </button>
                    {editingSessionId && (
                    <button
                      type="button"
                      className="conf-step__button movie-form__delete-button"
                      onClick={deleteSession}
                    >
                      Удалить сеанс
                    </button>
                  )}
                </fieldset>
              </div>
            )}

            <div
              className="conf-step__movies"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
            {movies.map((movie) => (
              <div
                className="conf-step__movie"
                key={movie.id}
                onClick={() => openMovieEditor(movie)}
                style={{ cursor: 'pointer' }}
              >
                  <img
                    className="conf-step__movie-poster"
                    src="/admin/i/poster.png"
                    alt={movie.title}
                  />

                  <h3 className="conf-step__movie-title">
                    {movie.title}
                  </h3>

                  <p className="conf-step__movie-duration">
                    {movie.duration} минут
                  </p>
                </div>
              ))}
            </div>

            <div className="conf-step__seances">
              {halls.map((hall) => {
                const hallSessions = sessionsForSelectedDate.filter(
                  (session) => session.hall === hall.id
                )

                return (
                  <div className="conf-step__seances-hall" key={hall.id}>
                    <h3 className="conf-step__seances-title">
                      {hall.name}
                    </h3>

                    <div className="conf-step__seances-timeline">
                      {hallSessions.map((session) => {
                        const startDate = new Date(session.start_time)

                        const hours = startDate.getHours()
                        const minutes = startDate.getMinutes()

                        const startMinutes = hours * 60 + minutes

                        const width = session.movie_duration / 2

                        const left = startMinutes / 2

                        const color =
                          session.movie % 2 === 0
                            ? 'rgb(133, 255, 137)'
                            : 'rgb(202, 255, 133)'

                        return (
                          <div
                            className="conf-step__seances-movie"
                            key={session.id}
                            onClick={() => openSessionEditor(session)}
                            style={{
                              width: `${width}px`,
                              left: `${left}px`,
                              backgroundColor: color,
                            }}
                          >
                            <p className="conf-step__seances-movie-title">
                              {session.movie_title}
                            </p>

                            <p className="conf-step__seances-movie-start">
                              {startDate.toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="conf-step">
          <header
            className={`conf-step__header ${
              openSteps.includes(4)
                ? 'conf-step__header_opened'
                : 'conf-step__header_closed'
            }`}
            onClick={() => toggleStep(4)}
          >
            <h2 className="conf-step__title">
              Открыть продажи
            </h2>
          </header>

          <div className="conf-step__wrapper text-center">
            <p className="conf-step__paragraph">
              Всё готово, теперь можно:
            </p>

            <button className="conf-step__button conf-step__button-accent">
              Открыть продажу билетов
            </button>
          </div>
        </section>
      </main>
    </>
  )
}

export default AdminPage
