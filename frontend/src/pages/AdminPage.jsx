import { useEffect, useState } from 'react'

function AdminPage() {
  const token = localStorage.getItem('adminToken')
  const [halls, setHalls] = useState([])
  const [isCreatingHall, setIsCreatingHall] = useState(false)
  const [hallName, setHallName] = useState('')
  const [hallRows, setHallRows] = useState('')
  const [hallSeats, setHallSeats] = useState('')

  const [openSteps, setOpenSteps] = useState([
    0,
    1,
    2,
    3,
    4,
  ])

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

  const toggleStep = (index) => {
    setOpenSteps((current) => {
      if (current.includes(index)) {
        return current.filter((step) => step !== index)
      }

      return [...current, index]
    })
  }

  const rows = Array.from({ length: 10 })

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
              {halls.map((hall, index) => (
                <li key={hall.id}>
                  <input
                    type="radio"
                    className="conf-step__radio"
                    name="chairs-hall"
                    value={hall.id}
                    defaultChecked={index === 0}
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

                {rows.map((_, rowIndex) => (
                  <div
                    className="conf-step__row"
                    key={rowIndex}
                  >
                    {Array.from({ length: 8 }).map((_, seatIndex) => (
                      <span
                        className="conf-step__chair conf-step__chair_standart"
                        key={seatIndex}
                      ></span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <fieldset className="conf-step__buttons text-center">
              <button className="conf-step__button conf-step__button-regular">
                Отмена
              </button>

              <input
                type="submit"
                value="Сохранить"
                className="conf-step__button conf-step__button-accent"
              />
            </fieldset>
          </div>
        </section>

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
              {halls.map((hall, index) => (
                <li key={hall.id}>
                  <input
                    type="radio"
                    className="conf-step__radio"
                    name="prices-hall"
                    value={hall.id}
                    defaultChecked={index === 0}
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
                  value="350"
                  readOnly
                />
              </label>

              за{' '}
              <span className="conf-step__chair conf-step__chair_vip"></span>
              {' '}VIP кресла
            </div>

            <fieldset className="conf-step__buttons text-center">
              <button className="conf-step__button conf-step__button-regular">
                Отмена
              </button>

              <input
                type="submit"
                value="Сохранить"
                className="conf-step__button conf-step__button-accent"
              />
            </fieldset>
          </div>
        </section>

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
              <button className="conf-step__button conf-step__button-accent">
                Добавить фильм
              </button>
            </p>

            <div className="conf-step__movies">
              <div className="conf-step__movie">
                <img
                  className="conf-step__movie-poster"
                  src="/admin/i/poster.png"
                  alt="Постер фильма"
                />

                <p className="conf-step__movie-title">
                  Интерстеллар
                </p>

                <p className="conf-step__movie-duration">
                  169 минут
                </p>
              </div>

              <div className="conf-step__movie">
                <img
                  className="conf-step__movie-poster"
                  src="/admin/i/poster.png"
                  alt="Постер фильма"
                />

                <p className="conf-step__movie-title">
                  Дюна
                </p>

                <p className="conf-step__movie-duration">
                  155 минут
                </p>
              </div>
            </div>

            <div className="conf-step__seances">
              {halls.map((hall) => (
                <div
                  className="conf-step__seances-hall"
                  key={hall.id}
                >
                  <h3 className="conf-step__seances-title">
                    {hall.name}
                  </h3>

                  <div className="conf-step__seances-timeline">
                    <div
                      className="conf-step__seances-movie"
                      style={{
                        width: '84.5px',
                        backgroundColor: 'rgb(133, 255, 0)',
                        left: '100px',
                      }}
                    >
                      <p className="conf-step__seances-movie-title">
                        Интерстеллар
                      </p>

                      <p className="conf-step__seances-movie-start">
                        19:00
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <fieldset className="conf-step__buttons text-center">
              <button className="conf-step__button conf-step__button-regular">
                Отмена
              </button>

              <input
                type="submit"
                value="Сохранить"
                className="conf-step__button conf-step__button-accent"
              />
            </fieldset>
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