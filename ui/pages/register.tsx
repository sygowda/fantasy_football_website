import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import Layout from '../components/Layout'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      return
    }

    // Call backend to insert into 'users' table
    const user = data.user
    const res = await fetch('http://localhost:8000/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: user.id, 
        full_name: fullName,
        email: email 
      }),
    })

    if (res.ok) {
      router.push('/dashboard') // or wherever
    } else {
      setError('Signup successful, but failed to register user in database.')
    }
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold mb-6 text-green-800 dark:text-green-100">Sign Up</h2>
      {error && <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-green-700 dark:text-green-200">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-green-700 dark:text-green-200">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-green-700 dark:text-green-200">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign Up
        </button>
      </form>
      <p className="text-sm mt-4 text-green-700 dark:text-green-200">
        Already have an account? <a href="/" className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline">Log in</a>
      </p>
    </Layout>
  )
} 