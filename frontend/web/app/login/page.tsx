"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@heroui/card"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { Form } from "@heroui/form"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email")
        const password = formData.get("password")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                throw new Error("Invalid credentials")
            }

            const data = await res.json()

            // simpan token ke localStorage
            localStorage.setItem("token", data.access_token)
            localStorage.setItem("user", JSON.stringify(data))

            // redirect ke dashboard
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen 
        bg-gradient-to-br from-slate-100 to-slate-300 
        dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <Card className="p-8 w-full max-w-md shadow-2xl bg-white dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
                    Admin Login
                </h1>
                <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Input
                        isRequired
                        name="email"
                        type="email"
                        label="Email"
                        labelPlacement="outside"
                        placeholder="Enter your email"
                        defaultValue="admin@gmail.com"
                        classNames={{
                            label: "text-gray-700 dark:text-gray-300",
                            input: "dark:text-white",
                        }}
                    />
                    <Input
                        isRequired
                        name="password"
                        type="password"
                        label="Password"
                        labelPlacement="outside"
                        placeholder="Enter your password"
                        defaultValue="admin123"
                        classNames={{
                            label: "text-gray-700 dark:text-gray-300",
                            input: "dark:text-white",
                        }}
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        color="primary"
                        isLoading={loading}
                        className="w-full"
                    >
                        Login
                    </Button>
                </Form>
            </Card>
        </div>
    )
}