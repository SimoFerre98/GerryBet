'use client'

import { FormHTMLAttributes } from 'react'
import toast from 'react-hot-toast'

interface Props extends Omit<FormHTMLAttributes<HTMLFormElement>, 'action'> {
  actionFunc: (formData: FormData) => Promise<any>
  successMessage?: string
}

export function ActionForm({ actionFunc, successMessage, children, ...props }: Props) {
  return (
    <form
      {...props}
      action={async (formData: FormData) => {
        try {
          const result = await actionFunc(formData)
          // Se l'azione ritorna un messaggio personalizzato, usa quello
          const message = result?.message || successMessage
          if (message) toast.success(message)
        } catch (e: any) {
          toast.error(e.message || 'Si è verificato un errore')
        }
      }}
    >
      {children}
    </form>
  )
}
