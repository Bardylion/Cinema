import { useEffect, useState } from 'react'

function AdminLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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

      <main>
        <section className="login">
          <header className="login__header">
            <h2 className="login__title">
              Авторизация
            </h2>
          </header>

          <div className="login__wrapper">
            <form
            className="login__form"
            onSubmit={(event) => {
                event.preventDefault()

                setError('')
                setIsLoading(true)

                fetch('http://127.0.0.1:8000/api/admin/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
                })
                .then(async (response) => {
                    const data = await response.json()

                    if (!response.ok) {
                    throw new Error(data.detail || 'Ошибка авторизации.')
                    }

                    return data
                })
                .then((data) => {
                console.log('Авторизация:', data)
                localStorage.setItem('adminToken', data.token)
                window.location.href = '/admin'
                })
                .catch((error) => {
                    setError(error.message)
                })
                .finally(() => {
                    setIsLoading(false)
                })
            }}
            >
                <label className="login__label">
                Логин
                <input
                    className="login__input"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(event) => {
                    setUsername(event.target.value)
                    }}
                    required
                />
                </label>

              <label className="login__label">
                Пароль
                    <input
                    className="login__input"
                    type="password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value)
                    }}
                    required
                    />
              </label>
                {error && (
                <p>
                    {error}
                </p>
                )}
              <div className="text-center">
                <input
                  value="Авторизоваться"
                  type="submit"
                  className="login__button"
                />
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}

export default AdminLoginPage