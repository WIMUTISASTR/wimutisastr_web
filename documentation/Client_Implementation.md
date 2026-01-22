# Client App Integration Guide

This guide shows how to integrate the membership-protected content system into your user-facing web frontend.

---

## 🎯 Overview

Your **admin panel** (current app) manages:
- ✅ Documents, Videos, Users
- ✅ Payment proof approval
- ✅ Membership management

Your **client app** (user-facing) needs to:
- ✅ Authenticate users with Supabase
- ✅ Check membership status
- ✅ Access protected content (books/videos)
- ✅ Handle membership errors gracefully

---

## 📋 Prerequisites

1. Your client app connects to the **same Supabase project**
2. Same `.env` variables for Supabase URL and keys
3. Users register/login via Supabase Auth

---

## 🔧 Step 1: Setup Supabase Client

### Install Supabase
```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

### Create Supabase Client (`lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper to get user token
export async function getUserToken() {
  const session = await getSession()
  return session?.access_token || null
}
```

---

## 🔐 Step 2: User Authentication

### Registration
```typescript
// pages/signup.tsx or components/SignupForm.tsx
import { supabase } from '@/lib/supabase'

async function handleSignup(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // User profile is automatically created with membership_status = 'pending'
    alert('Registration successful! Please upload payment proof to activate membership.')
    
    // Redirect to payment proof upload page
    router.push('/upload-payment')
  } catch (error) {
    console.error('Signup error:', error)
  }
}
```

### Login
```typescript
// pages/login.tsx or components/LoginForm.tsx
import { supabase } from '@/lib/supabase'

async function handleLogin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Redirect to home/content page
    router.push('/content')
  } catch (error) {
    console.error('Login error:', error)
  }
}
```

### Get Current User
```typescript
import { supabase } from '@/lib/supabase'

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## 📚 Step 3: Fetch Protected Content

### Create API Client (`lib/api.ts`)
```typescript
import { getUserToken } from './supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export class ApiClient {
  private async getHeaders() {
    const token = await getUserToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async fetchBooks(page = 1, limit = 20) {
    const headers = await this.getHeaders()
    const response = await fetch(
      `${API_BASE_URL}/api/books-public?page=${page}&limit=${limit}`,
      { headers }
    )

    if (response.status === 403) {
      throw new MembershipRequiredError('You need an active membership to access books')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch books')
    }

    return response.json()
  }

  async fetchVideos(page = 1, limit = 20) {
    const headers = await this.getHeaders()
    const response = await fetch(
      `${API_BASE_URL}/api/videos-public?page=${page}&limit=${limit}`,
      { headers }
    )

    if (response.status === 403) {
      throw new MembershipRequiredError('You need an active membership to access videos')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch videos')
    }

    return response.json()
  }

  async fetchBook(id: string) {
    const headers = await this.getHeaders()
    const response = await fetch(
      `${API_BASE_URL}/api/books-public?id=${id}`,
      { headers }
    )

    if (response.status === 403) {
      throw new MembershipRequiredError('You need an active membership to access this book')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch book')
    }

    return response.json()
  }

  async fetchVideo(id: string) {
    const headers = await this.getHeaders()
    const response = await fetch(
      `${API_BASE_URL}/api/videos-public?id=${id}`,
      { headers }
    )

    if (response.status === 403) {
      throw new MembershipRequiredError('You need an active membership to access this video')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch video')
    }

    return response.json()
  }

  getFileUrl(fileUrl: string) {
    // If the file URL uses our API serve endpoint, it's already protected
    return fileUrl
  }
}

// Custom error for membership issues
export class MembershipRequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MembershipRequiredError'
  }
}

export const api = new ApiClient()
```

---

## 📖 Step 4: Check Membership Status

### Create Membership Hook (`hooks/useMembership.ts`)
```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface MembershipStatus {
  status: 'pending' | 'approved' | 'denied' | null
  isLoading: boolean
  error: string | null
}

export function useMembership(): MembershipStatus {
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembershipStatus()
  }, [])

  async function fetchMembershipStatus() {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus(null)
        return
      }

      // Fetch user profile with membership status
      const { data, error } = await supabase
        .from('user_profiles')
        .select('membership_status')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setStatus(data?.membership_status || 'pending')
    } catch (err: any) {
      console.error('Error fetching membership:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return { status, isLoading, error }
}
```

---

## 🎨 Step 5: Create UI Components

### Books List Page (`pages/books.tsx`)
```typescript
import { useEffect, useState } from 'react'
import { api, MembershipRequiredError } from '@/lib/api'
import { useMembership } from '@/hooks/useMembership'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { status: membershipStatus, isLoading: membershipLoading } = useMembership()

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    try {
      setIsLoading(true)
      setError(null)
      const { data } = await api.fetchBooks(1, 20)
      setBooks(data)
    } catch (err: any) {
      if (err instanceof MembershipRequiredError) {
        setError('membership_required')
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show membership required message
  if (error === 'membership_required' || membershipStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">
            Membership Required
          </h2>
          <p className="text-yellow-800 mb-6">
            You need an active membership to access our library of books.
            {membershipStatus === 'pending' && 
              ' Your membership is pending approval. Please upload payment proof or wait for admin approval.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/upload-payment'}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
          >
            Upload Payment Proof
          </button>
        </div>
      </div>
    )
  }

  if (membershipStatus === 'denied') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Membership Denied
          </h2>
          <p className="text-red-800 mb-6">
            Your membership application was not approved. Please contact support for assistance.
          </p>
          <a
            href="mailto:support@example.com"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  if (isLoading || membershipLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Books Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book: any) => (
          <div key={book.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            {book.cover_url && (
              <img src={book.cover_url} alt={book.title} className="w-full h-48 object-cover rounded mb-4" />
            )}
            <h3 className="font-bold text-lg mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            <a
              href={`/books/${book.id}`}
              className="text-blue-600 hover:underline"
            >
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Book Detail/Reader Page (`pages/books/[id].tsx`)
```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'

export default function BookDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [book, setBook] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadBook(id as string)
    }
  }, [id])

  async function loadBook(bookId: string) {
    try {
      setIsLoading(true)
      const { data } = await api.fetchBook(bookId)
      setBook(data)
    } catch (error) {
      console.error('Error loading book:', error)
      alert('Failed to load book. Please check your membership status.')
      router.push('/books')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <button 
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Books
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{book.title}</h1>
        <p className="text-xl text-gray-600 mb-6">by {book.author} ({book.year})</p>
        
        {book.cover_url && (
          <img src={book.cover_url} alt={book.title} className="w-64 h-auto mb-6" />
        )}

        <p className="text-gray-700 mb-8">{book.description}</p>

        {/* PDF Viewer - file_url is already protected */}
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={book.file_url}
            className="w-full h-screen"
            title={book.title}
          />
        </div>
      </div>
    </div>
  )
}
```

### Video Player Page (Similar pattern)
```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { api } from '@/lib/api'

export default function VideoDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [video, setVideo] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadVideo(id as string)
    }
  }, [id])

  async function loadVideo(videoId: string) {
    try {
      const { data } = await api.fetchVideo(videoId)
      setVideo(data)
    } catch (error) {
      console.error('Error loading video:', error)
      router.push('/videos')
    }
  }

  if (!video) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{video.title}</h1>
      
      {/* Video Player - file_url is already protected */}
      <video 
        controls 
        className="w-full max-w-4xl mx-auto"
        src={video.file_url}
      >
        Your browser does not support the video tag.
      </video>

      <div className="mt-6">
        <p className="text-gray-700">{video.description}</p>
        {video.presented_by && (
          <p className="text-gray-600 mt-2">Presented by: {video.presented_by}</p>
        )}
      </div>
    </div>
  )
}
```

---

## 🔒 Step 6: Protected Route Component

### Protect pages that require membership (`components/ProtectedRoute.tsx`)
```typescript
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useMembership } from '@/hooks/useMembership'
import { supabase } from '@/lib/supabase'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status, isLoading } = useMembership()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    setIsAuthenticated(true)
  }

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  if (status !== 'approved') {
    router.push('/membership-required')
    return null
  }

  return <>{children}</>
}
```

### Use it in pages
```typescript
// pages/books.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function BooksPage() {
  return (
    <ProtectedRoute>
      {/* Your content here */}
    </ProtectedRoute>
  )
}
```

---

## 🎯 Step 7: Payment Proof Upload

### Upload Payment Proof Page (`pages/upload-payment.tsx`)
```typescript
import { useState } from 'react'
import { supabase, getUserToken } from '@/lib/supabase'

export default function UploadPaymentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [planId, setPlanId] = useState('monthly')
  const [amount, setAmount] = useState('3.00')
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!file) {
      alert('Please select a payment proof image')
      return
    }

    try {
      setIsUploading(true)

      // 1. Upload file to R2 storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'payment-proofs')
      formData.append('path', `proofs/${Date.now()}-${file.name}`)

      const token = await getUserToken()
      const uploadResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      const uploadResult = await uploadResponse.json()
      const proofUrl = uploadResult.data?.publicUrl || uploadResult.data?.url

      // 2. Create payment proof record
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('payment_proofs')
        .insert({
          user_id: user?.id,
          payment_reference: `REF-${Date.now()}`,
          plan_id: planId,
          amount: amount,
          proof_url: proofUrl,
          file_name: file.name,
          file_size: file.size.toString(),
          file_type: file.type,
          status: 'pending',
        })

      if (error) throw error

      alert('Payment proof uploaded successfully! Please wait for admin approval.')
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Failed to upload payment proof: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Upload Payment Proof</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Select Plan</label>
          <select 
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full border rounded px-4 py-2"
          >
            <option value="monthly">Monthly - $3.00</option>
            <option value="yearly">Yearly - $30.00</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Amount Paid</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Payment Proof Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Submit Payment Proof'}
        </button>
      </form>
    </div>
  )
}
```

---

## 🌐 Environment Variables (Client App)

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key

# API URL (your admin panel URL)
NEXT_PUBLIC_API_URL=https://your-admin-domain.com
# or for local development:
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ✅ Complete User Flow

1. **User registers** → `membership_status = 'pending'`
2. **User uploads payment proof** → Creates record in `payment_proofs` table
3. **Admin approves in admin panel** → `/dashboard/payments/{id}` → Click "Approve"
4. **User gets access** → `membership_status = 'approved'`
5. **User can view content** → Books and videos are now accessible

---

## 🚨 Error Handling Best Practices

```typescript
// Centralized error handler
function handleApiError(error: any) {
  if (error instanceof MembershipRequiredError) {
    // Redirect to membership page
    router.push('/membership-required')
  } else if (error.message?.includes('auth')) {
    // Redirect to login
    router.push('/login')
  } else {
    // Show generic error
    alert('An error occurred: ' + error.message)
  }
}
```

---

## 🎉 Summary

Your client app now:
- ✅ Authenticates users with Supabase
- ✅ Checks membership status
- ✅ Fetches protected content with proper tokens
- ✅ Handles membership errors gracefully
- ✅ Shows appropriate messages for each status
- ✅ Allows payment proof upload

All content is protected and only accessible to approved members! 🔒
