import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-6xl font-extrabold text-indigo-600 tracking-tight">GerryBet</h1>
        <p className="text-2xl text-gray-600 font-medium">
          Benvenuti nel sito di scommesse del torneo estivo!
        </p>
        
        <div className="pt-8 flex flex-col items-center space-y-6">
          {user ? (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-4 w-full max-w-md">
              <p className="text-xl text-gray-700">
                Ciao, <span className="font-bold text-indigo-600">{user.email}</span>!
              </p>
              <div className="pt-4">
                <form action="/auth/signout" method="post">
                  <button className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Esci dal tuo account
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Link 
                href="/login" 
                className="inline-block px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
              >
                Accedi o Registrati
              </Link>
              <p className="text-sm text-gray-500 italic">
                Crea un account per iniziare a scommettere
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
