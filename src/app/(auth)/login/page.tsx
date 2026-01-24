"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextField, Box, Button } from "@mui/material";
import Logo from "@/components/Logo";

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ email?: string; password?: string }>({});

  //   useEffect(() => {
  //     const checkAuth = async () => {
  //       const isAuth = !!(await isAuthenticated());
  //       if (isAuth) router.push("/");
  //     };
  //     checkAuth();
  //   }, []);

  //   const onLogin = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setError({}); // reset errors
  //     const success = await login(email, password);

  //     if (success) {
  //       router.push("/");
  //     } else {
  //       setError({
  //         email: t("errors.login"),
  //         password: t("errors.login"),
  //       });
  //     }
  //   };

  return (
    <div
      className="-z-10 flex h-screen max-h-screen min-h-screen flex-col items-center justify-center gap-y-2 transition-colors duration-300"
      style={{ backgroundColor: "background" }}
    >
      <Box
        component="form"
        onSubmit={() => console.log("H!")} // should be onLogin
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label={"Email"}
            error={!!error.email}
            helperText={error.email}
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
        </div>
      </Box>
    </div>
  );
}

export default Login;
