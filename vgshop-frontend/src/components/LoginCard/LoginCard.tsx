"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import api from "@/lib/api";

export function LoginCard() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/login/", {
        username: username,
        password: password,
      });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user_data", JSON.stringify(user));

      window.location.href = "/";
    } catch (error: any) {
      if (error.status === 401) {
        setErrorMessage("Username o password non validi, riprova");
      } else {
        setErrorMessage("Login non riuscito, riprova");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mx-auto my-28 max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your username below to login to your account
        </CardDescription>
        <CardAction>
          <Button
            variant="link"
            onClick={() => {
              window.location.href = "/register";
            }}
          >
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              onChange={(e) => setUsername(e.target.value)}
              id="username"
              type="text"
              placeholder="Username"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            {loading && <Spinner className="ml-2" data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-red-500 text-destructive-foreground">
          {errorMessage}
        </p>
      </CardFooter>
    </Card>
  );
}
