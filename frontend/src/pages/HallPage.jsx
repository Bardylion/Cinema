import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function HallPage() {
  const { sessionId } = useParams()
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [session, setSession] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/seats/`)
      .then((response) => response.json())
      .then((data) => setSeats(data))
  }, [sessionId])

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/`)
      .then((response) => response.json())
      .then((data) => setSession(data))
  }, [sessionId])

  const rows = [...new Set(seats.map((seat) => seat.row))]

  const toggleSeat = (seat) => {
    if (seat.booked || !session || new Date(session.start_time) < new Date()) {
      return
    }

    setSelectedSeats((current) => {
      if (current.includes(seat.id)) {
        return current.filter((id) => id !== seat.id)
      }

      return [...current, seat.id]
    })
  }

  const selectedTotal = seats
  .filter((seat) => selectedSeats.includes(seat.id))
  .reduce((total, seat) => {
    const price =
      seat.seat_type === 'VIP'
        ? Number(session?.base_price || 0) + 200
        : Number(session?.base_price || 0)

    return total + price
  }, 0)

  const handleBooking = () => {
    setIsBooking(true)
    fetch('http://127.0.0.1:8000/api/bookings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail,
        session: sessionId,
        seats: selectedSeats,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не удалось создать бронирование')
        }

        return response.json()
      })
      .then((data) => {
        console.log(data)
        window.location.href = `/ticket/${data.booking_code}`
      })
      .catch((error) => {
        setBookingError(error.message)
        setIsBooking(false)
      })
  }
  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title">
          Идём<span>в</span>кино
        </h1>
      </header>

      <main>
        <section className="buying">
          <div className="buying__info">
            <div className="buying__info-description">
              <h2 className="buying__info-title">
                {session?.movie_title}
              </h2>

              <p className="buying__info-start">
                Начало сеанса: {session?.start_time
                  ? new Date(session.start_time).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </p>

              <p className="buying__info-hall">
                {session?.hall_name}
              </p>
            </div>

            <div className="buying__info-hint">
              <p>
                Тапните дважды,
                <br />
                чтобы увеличить
              </p>
            </div>
          </div>

          <div className="buying-scheme">
            <div className="buying-scheme__wrapper">
              {rows.map((row) => (
                <div className="buying-scheme__row" key={row}>
                  {seats
                    .filter((seat) => seat.row === row)
                    .map((seat) => (
                      <span
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        className={`buying-scheme__chair ${
                          seat.booked
                            ? 'buying-scheme__chair_taken'
                            : selectedSeats.includes(seat.id)
                              ? 'buying-scheme__chair_selected'
                              : seat.seat_type === 'VIP'
                                ? 'buying-scheme__chair_vip'
                                : 'buying-scheme__chair_standart'
                        }`}
                      ></span>
                    ))}
                </div>
              ))}
            </div>

            <div className="buying-scheme__legend">
              <div className="col">
                <p className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_standart"></span>
                  {' '}Свободно
                </p>

                <p className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_vip"></span>
                  {' '}Свободно VIP
                </p>
              </div>

              <div className="col">
                <p className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_taken"></span>
                  {' '}Занято
                </p>

                <p className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_selected"></span>
                  {' '}Выбрано
                </p>
              </div>
            </div>
            <div className="buying-scheme__summary">
              <p>Выбрано мест: {selectedSeats.length}</p>
              <p>Сумма: {selectedTotal} ₽</p>
            </div>
            <div className="booking-form">
              <input
                type="text"
                placeholder="Ваше имя"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />

              <input
                type="email"
                placeholder="Ваш email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </div>
          </div>
          {bookingError && (
            <p className="booking-error">
              {bookingError}
            </p>
          )}
          <button
            className="acceptin-button"
            disabled={
              selectedSeats.length === 0 ||
              !session ||
              new Date(session.start_time) < new Date() || isBooking
            }
            onClick={handleBooking}
          >
            {isBooking ? 'Бронирование...' : 'Забронировать'}
          </button>
        </section>
      </main>
    </>
  )
}

export default HallPage