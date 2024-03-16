"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function NavLogo({ size = 32 }: { size?: number }) {
  const [darkMode, setDarkMode] = useState(true);

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
          width={size}
          height={size}
          alt="Lynx Locks"
        ></Image>
      ) : (
        <Image
          src="/logo/lynx.png"
          width={size}
          height={size}
          alt="Lynx Locks"
        ></Image>
      )}
    </div>
  );
}
