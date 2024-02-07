"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function NavLogo() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", (e) => {
      setDarkMode(e.matches);
    });
    setDarkMode(mq.matches);
  }, []);

  return (
    <div>
      {darkMode ? (
        <Image
          src="/logo/lynx-white.png"
          width={32}
          height={32}
          alt="Lynx Locks"
        ></Image>
      ) : (
        <Image
          src="/logo/lynx.png"
          width={32}
          height={32}
          alt="Lynx Locks"
        ></Image>
      )}
    </div>
  );
}
