"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Navbar from "./index";

export default function NavbarContainer() {
  const router = useRouter();

  const user = { firstName: "John", lastName: "Doe", avatarUrl: null };

  async function handleLogout() {
    try {
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }

  return <Navbar user={user} onLogout={handleLogout} />;
}
