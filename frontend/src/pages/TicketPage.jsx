import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function TicketPage() {
  const { bookingCode } = useParams()
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/bookings/code/${bookingCode}/`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setBooking(data)
      })
    }, [bookingCode])
  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title">
          Идём<span>в</span>кино
        </h1>
      </header>

      <main>
        <section className="ticket">
          <header className="tichet__check">
            <h2 className="ticket__check-title">
              Электронный билет
            </h2>
          </header>

          <div className="ticket__info-wrapper">
            <p className="ticket__info">
              На фильм:{' '}
              <span className="ticket__details ticket__title">
                {booking?.tickets?.[0]?.movie}
              </span>
            </p>

            <p className="ticket__info">
              Места:{' '}
              <span className="ticket__details ticket__chairs">
                {booking?.tickets?.map((ticket) => ticket.seat_number).join(', ')}
              </span>
            </p>

            <p className="ticket__info">
              В зале:{' '}
              <span className="ticket__details ticket__hall">
                {booking?.tickets?.[0]?.hall}
              </span>
            </p>

            <p className="ticket__info">
              Начало сеанса:{' '}
              <span className="ticket__details ticket__start">
                {booking?.tickets?.[0]?.start_time}
              </span>
            </p>

            <img
            className="ticket__info-qr"
            src={booking?.tickets?.[0]?.qr_code}
            alt="QR-код билета"
            />

            <p className="ticket__hint">
              Покажите QR-код нашему контроллеру для подтверждения бронирования.
            </p>

            <p className="ticket__hint">
              Приятного просмотра!
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

export default TicketPage