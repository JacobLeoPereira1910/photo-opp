import { LogOut, Shield } from 'lucide-react'
import { startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context.jsx'
import { Button } from '../ui/button.jsx'

export function ActivationSessionActions() {
  const navigate = useNavigate()
  const auth = useAuth()

  function handleLogout() {
    auth.logout()
    startTransition(() => {
      navigate('/login')
    })
  }

  return (
    <div className="flex items-center gap-2">
      {auth.user?.role === 'admin' ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            startTransition(() => {
              navigate('/admin')
            })
          }}
        >
          <Shield className="mr-2 size-4" />
          Admin
        </Button>
      ) : null}

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 size-4" />
        Sair
      </Button>
    </div>
  )
}
