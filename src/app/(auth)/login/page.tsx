"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextField, Box, Button, useStepContext } from "@mui/material";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";

function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ username?: string; password?: string }>(
    {},
  );

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = !!(await isAuthenticated);
      console.log("is authenticated", isAuthenticated);
      console.log("is auth", isAuth)
      if (isAuth) router.push("/");
    };
    checkAuth();
  }, []);

  const checkHealth = async (e: any) => {
    const res = await fetch("api/health", {
      method: "GET",
    });
    const data = await res.json();
    setHealthData(data);
    console.log(healthData);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({}); // reset errors
    console.log("hey there", username, password);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log("Login success", response);
      router.push("/");
    } else if (response.status === 401) {
      console.log("Unauthorized", response);
      setError({
        username: "Invalid credentials",
        password: "Invalid credentials",
      });
    } else {
      console.log("Other error", response.status);
      setError({
        username: "Something went wrong, please try again later.",
      });
    }
  };

  return (
    <div
      className="-z-10 flex h-screen max-h-screen min-h-screen flex-col items-center justify-center gap-y-2 transition-colors duration-300"
      style={{ backgroundColor: "background" }}
    >
      {showDebug && (
        <Box>
          <h2>Backend check health.</h2>
          <p>
            temporarily to be used to check if the backend is running and
            reachable or not. if not, check the env on the front end first.
          </p>
          {healthData && <span>{JSON.stringify(healthData)}</span>}
          <Button onClick={checkHealth}>Check Health</Button>
        </Box>
      )}
      <Box
        component="form"
        onSubmit={onLogin}
        className="relative flex flex-col items-center justify-center gap-y-10 rounded-2xl p-10 shadow-2xl transition-colors duration-300"
        sx={{
          maxHeight: 600,
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          background: "background",
        }}
      >
        {/* <h2
          className="text-6xl transition-colors duration-300 relative mb-6"
          style={{ color: "text" }}
        >
          WatchTower DB
        </h2> */}
        <Logo className="self-center" height={400} width={400} />

        <div className="flex w-full flex-col gap-y-4">
          <TextField
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            label={"Username"}
            error={!!error.username}
            helperText={error.username}
            sx={{ width: "100%" }}
            required
          />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            label={"Password"}
            error={!!error.password}
            helperText={error.password}
            sx={{ width: "100%" }}
            required
          />
        </div>

        <div className="relative mt-6 flex w-full items-center justify-center">
          <Button
            type="submit"
            sx={{
              transition: "color 0.3s ease, background-color 0.3s ease",
              height: "120%",
              width: "50%",
              background: "text",
              color: "text",
              borderRadius: "30px",
              "&:hover": { background: "idfk rn" },
            }}
          >
            Login
          </Button>
          <Button
            onClick={() => setShowDebug((prev) => !prev)}
            sx={{
              transition: "color 0.3s ease, background-color 0.3s ease",
              height: "120%",
              width: "50%",
              background: "text",
              color: "text",
              borderRadius: "30px",
              "&:hover": { background: "idfk rn" },
            }}
          >
            Check Health*
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default Login;
