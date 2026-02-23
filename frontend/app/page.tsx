import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EventHub Pro - Event & Access Management System',
  description: 'Professional event management and ticketing platform',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">🎯 EventHub Pro</h1>
        <p className="text-xl mb-8">Event & Access Management System</p>
        <div className="flex gap-4 justify-center">
          <a 
            href="/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </a>
          <a 
            href="/register" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  )
}
