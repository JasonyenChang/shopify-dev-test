"use client";
import { useState, useEffect, startTransition } from "react";

/*
Fetch user info from the localstorage
*/
export default function useCurrentUser() {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);

                    startTransition(() => {
                        setUser(userData);
                    });

                } catch (e) {
                    console.error("Auth error", e);
                }
            }
        }
    }, []);

    return user;
}