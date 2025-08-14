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
  const [files, setFiles] = useState<{ name: string; url: string; bucket: string }[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  const { signIn, user } = useAuth()
  const router = useRouter()

  const maxAttempts = 5
  const isBlocked = attempts >= maxAttempts

  const fetchImages = async () => {
    setLoadingFiles(true)
    try {
      // Explicitly list your buckets
      const bucketNames = ["files", "photos", "pdf"];
      const allFiles: { name: string; url: string; bucket: string }[] = [];
      for (const bucketName of bucketNames) {
        const { data: filesData, error: filesError } = await supabase.storage.from(bucketName).list("");
        const filesArr = Array.isArray(filesData) ? filesData : [];
        if (!filesError && filesArr.length > 0) {
          for (const file of filesArr) {
            // Try to get a signed URL for download (valid for 1 hour)
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(file.name, 3600);
            allFiles.push({
              name: file.name,
              url: signedUrlData?.signedUrl || "",
              bucket: bucketName,
            });
          }
        }
      }
      setFiles(allFiles);
      console.log("Loaded files:", allFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    if (user) {
      console.log("Admin authenticated successfully");
      setSuccess(true);
      fetchImages();
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <header className="w-full px-8 py-6 flex items-center justify-between bg-white dark:bg-gray-900 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Vault Dashboard</h1>
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => {
              setSuccess(false);
              setEmail("");
              setPassword("");
              setFiles([]);
            }}
          >Sign Out</Button>
        </header>
        <main className="flex-1 w-full max-w-4xl mx-auto py-10 px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Files</h2>
            <p className="text-gray-500 dark:text-gray-400">All files stored in your vault. Click to view or download.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            {loadingFiles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : files.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Bucket</th>
                    <th className="py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">File Name</th>
                    <th className="py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2 px-3 text-gray-800 dark:text-gray-100 font-mono">{file.bucket}</td>
                      <td className="py-2 px-3 text-gray-800 dark:text-gray-100 font-mono truncate max-w-xs">{file.name}</td>
                      <td className="py-2 px-3">
                        {file.url ? (
                          <>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">View</a>
                            <a href={file.url} download className="text-green-600 hover:underline">Download</a>
                          </>
                        ) : (
                          <span className="text-gray-400">No access</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center py-12">
                <Database className="h-10 w-10 text-gray-400 mb-4" />
                <span className="text-lg text-gray-500">No files found in your vault.</span>
              </div>
            )}
          </div>
        </main>
      </div>
    );
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
