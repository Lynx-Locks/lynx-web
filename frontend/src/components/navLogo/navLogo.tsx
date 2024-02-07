"use client";

import Image from "next/image";

export default function NavLogo() {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
