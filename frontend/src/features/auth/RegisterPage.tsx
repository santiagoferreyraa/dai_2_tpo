import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { ApiError } from '@/lib/api'

import AuthLayout from './components/AuthLayout'
import FormField from './components/FormField'
import { register } from './data/authRepository'

/**
 * Pantalla de registro (RF01 / ECO-36).
 *
 * **Al terminar manda al login, no deja la sesión abierta.** El backend responde 201 con el
 * perfil y sin token, así que entrar solo sería posible encadenando un login por detrás. Se
 * decidió no hacerlo: el usuario estrena la contraseña que acaba de elegir, y el registro
 * queda como una operación que crea la cuenta y nada más.
 *
 * El rol tampoco se pide. Todo el que se registra nace conductor; elevar a operador o
 * administrador es una operación administrativa, no una casilla de este formulario.
 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      await register({ email: email.trim(), password, fullName: fullName.trim() })
      /*
       * El mensaje viaja en el estado de la navegación y no como un cartel de esta pantalla,
       * porque esta pantalla se desmonta al navegar. Sin eso, el usuario aterriza en un login
       * sin ninguna señal de que el alta salió bien.
       */
      void navigate('/login', {
        replace: true,
        state: { notice: 'Tu cuenta se creó. Entrá con tu email y contraseña.' },
      })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No se pudo crear la cuenta')
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Registrate para reservar y cargar."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link className="text-primary font-medium hover:underline" to="/login">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="register-name"
          label="Nombre completo"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          required
        />
        <FormField
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <FormField
          id="register-password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          hint="Al menos 6 caracteres."
          required
        />

        {error !== null && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          className="bg-primary rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={sending}
        >
          {sending ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  )
}
