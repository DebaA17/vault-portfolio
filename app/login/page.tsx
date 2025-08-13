"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff, Loader2, Lock, CheckCircle, Settings, ImageIcon, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  const { signIn, user } = useAuth()
  const router = useRouter()

  const maxAttempts = 5
  const isBlocked = attempts >= maxAttempts

  const fetchImages = async () => {
    setLoadingImages(true)
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("Error fetching buckets:", bucketsError)
        return
      }

      console.log("Available buckets:", buckets)

      const bucketNames = ["images", "uploads", "files", "vault", "public"]
      const imageUrls: string[] = []

      for (const bucketName of bucketNames) {
        const bucketExists = buckets?.find((bucket) => bucket.name === bucketName)
        if (bucketExists) {
          const { data: files, error: filesError } = await supabase.storage.from(bucketName).list("", { limit: 10 })

          if (!filesError && files && files.length > 0) {
            console.log(`Found files in ${bucketName}:`, files)

            const imageFiles = files.filter((file) => file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))

            for (const file of imageFiles) {
              const { data } = supabase.storage.from(bucketName).getPublicUrl(file.name)

              if (data?.publicUrl) {
                imageUrls.push(data.publicUrl)
              }
            }
            break
          }
        }
      }

      if (imageUrls.length === 0 && buckets && buckets.length > 0) {
        const firstBucket = buckets[0].name
        const { data: files, error: filesError } = await supabase.storage.from(firstBucket).list("", { limit: 10 })

        if (!filesError && files && files.length > 0) {
          console.log(`Found files in ${firstBucket}:`, files)

          const imageFiles = files.filter((file) => file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))

          for (const file of imageFiles) {
            const { data } = supabase.storage.from(firstBucket).getPublicUrl(file.name)

            if (data?.publicUrl) {
              imageUrls.push(data.publicUrl)
            }
          }
        }
      }

      setImages(imageUrls)
      console.log("Loaded images:", imageUrls)
    } catch (err) {
      console.error("Error fetching images:", err)
    } finally {
      setLoadingImages(false)
    }
  }

  useEffect(() => {
    if (user) {
      console.log("Admin authenticated successfully")
      setSuccess(true)
      fetchImages()
    }
  }, [user, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isBlocked) {
      setError("Too many failed attempts. Please refresh the page and try again.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error("Login error:", error.message)
        setAttempts((prev) => prev + 1)
        setError("Invalid admin credentials. Access denied.")
        setPassword("")
      } else {
        console.log("Login successful, admin authenticated")
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 p-4">
        <Card className="w-full max-w-2xl border-emerald-200 dark:border-emerald-800 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="relative">
                <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 animate-in zoom-in-0 duration-700 delay-200" />
                <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-emerald-500/20 animate-ping" />
              </div>
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-300">
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Admin Panel Active</h2>
                <p className="text-muted-foreground">Welcome back, Administrator</p>

                <div className="grid gap-3 mt-6">
                  <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-emerald-600" />
                      <div className="text-left">
                        <p className="font-medium text-emerald-700 dark:text-emerald-300">System Status</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">All systems operational</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-slate-600" />
                      <div className="text-left">
                        <p className="font-medium text-slate-700 dark:text-slate-300">Security Level</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Maximum protection active</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-blue-700 dark:text-blue-300">Database Images</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {loadingImages ? "Loading..." : `${images.length} images found`}
                          </p>
                        </div>
                      </div>

                      {loadingImages ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                      ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {images.slice(0, 4).map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Database image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-blue-200 dark:border-blue-700 transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  console.error("Image failed to load:", imageUrl)
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors duration-200" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4 text-blue-600 dark:text-blue-400">
                          <ImageIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm">No images found in storage</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                    setPassword("")
                    setImages([])
                  }}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-red-950 dark:to-slate-950 p-4">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center">
            <div className="relative p-4 bg-red-500/10 rounded-full animate-in zoom-in-0 duration-500 delay-200">
              <Lock className="h-10 w-10 text-red-500" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Authorized personnel only</p>
          </div>
        </div>

        <Card className="border-red-200 dark:border-red-800 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Secure Login
            </CardTitle>
            <CardDescription>Enter your admin credentials to access the control panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || isBlocked}
                  autoComplete="username"
                  className="transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || isBlocked}
                    className="pr-10 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-all duration-200 hover:scale-110"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isBlocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                  <AlertDescription>
                    {error}
                    {attempts > 0 && attempts < maxAttempts && (
                      <div className="mt-1 text-sm">Attempts remaining: {maxAttempts - attempts}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                disabled={loading || isBlocked}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : isBlocked ? (
                  "Access Blocked"
                ) : (
                  "Access Admin Panel"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 animate-in fade-in-0 duration-500 delay-700">
          <p className="text-sm text-muted-foreground">
            This system is for authorized access only. All login attempts are logged.
          </p>
        </div>
      </div>
    </div>
  )
}
