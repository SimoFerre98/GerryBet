import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50 text-black">
      <div className="p-8 bg-white shadow-md rounded-lg w-96 border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Errore di Autenticazione</h1>
        <p className="mb-6 text-gray-600">Si è verificato un problema durante la verifica del codice. Il link potrebbe essere scaduto o non valido.</p>
        <Link 
          href="/login"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Torna al Login
        </Link>
      </div>
    </div>
  )
}
