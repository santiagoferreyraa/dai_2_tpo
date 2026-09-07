import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { ApiError } from '@/lib/api'

import AuthLayout from './components/AuthLayout'
import FormField from './components/FormField'
import { login } from './data/authRepository'
import { openSession } from './session'

/**
 * Pantalla de login (RF01 / ECO-36).
 *
 * Al entrar abre la sesión y devuelve al usuario a donde quería ir. Ese destino lo deja el
 * guard en el estado de la navegación: si alguien pega la dirección del ABM sin sesión, entra
 * acá y termina en el ABM, no en la home. Sin eso, el redirect al login se lleva puesta la
 * intención original y hay que volver a navegar a mano.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const state = location.state as { from?: string; notice?: string } | null
  const target = state?.from ?? '/'
  const notice = state?.notice

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      openSession(await login({ email: email.trim(), password }))
      // `replace` para que el botón de atrás no vuelva al login ya resuelto.
      void navigate(target, { replace: true })
    } catch (cause) {
      /*
       * El backend contesta 400 con "Credenciales inválidas" tanto si el mail no existe como
       * si la contraseña no coincide, y está bien que no distinga: decir cuál de las dos
       * falló le confirma a un desconocido qué direcciones están registradas.
       */
      setError(cause instanceof ApiError ? cause.message : 'No se pudo iniciar sesión')
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Entrá con tu cuenta de Ecopedia."
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link className="text-primary font-medium hover:underline" to="/register">
            Registrate
          </Link>
        </>
      }
    >
      {notice !== undefined && (
        <p className="border-border bg-background text-text-muted mb-4 rounded-lg border px-3 py-2 text-sm">
          {notice}
        </p>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          id="login-password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          required
        />

        {error !== null && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          className="bg-primary rounded-lg text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          type="submit"
          disabled={sending}
        >
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
