"use client";

import { useState, useEffect } from 'react';

export default function AccessCheck({ children }: { children: React.ReactNode }) {
  const ENTRY_PASS = process.env.NEXT_PUBLIC_ENTRY_PASS;
  const [access, setAccess] = useState(0);

  useEffect(() => {
    let entryPass = sessionStorage.getItem("entryPass");

    if (entryPass === ENTRY_PASS) {
      setAccess(1);
    } else {
      setAccess(0);
      let userInput = prompt("Please enter the password");

      if (userInput === ENTRY_PASS) {
        sessionStorage.setItem("entryPass", userInput);
        setAccess(1);
      } else {
        alert("Wrong Password. Please try again.");
      }
    }
  }, []);

  return (
    <>
      {access ? (
        <div>{children}</div>
      ) : (
        <div>Access denied. Please reload to try again.</div>
      )}
    </>
  );
}
