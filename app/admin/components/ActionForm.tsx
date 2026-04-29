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
          await actionFunc(formData)
          if (successMessage) toast.success(successMessage)
        } catch (e: any) {
          toast.error(e.message || 'Si è verificato un errore')
        }
      }}
    >
      {children}
    </form>
  )
}
