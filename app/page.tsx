"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Lock } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 p-3 bg-slate-900 rounded-full w-fit">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Access</CardTitle>
          <CardDescription className="text-slate-600">Authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
            <Lock className="h-5 w-5 text-slate-600" />
            <div>
              <p className="font-medium text-slate-900">Secure Access</p>
              <p className="text-sm text-slate-600">Protected admin panel</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-lg font-medium"
            size="lg"
          >
            Access Admin Panel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
