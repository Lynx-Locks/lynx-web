"use client";

import Modal from "@/components/modal/modal";
import { useRouter } from "next/navigation";
import Confirmation from "@/components/tokenConfirmation/tokenConfirmation";

export default function TokenConfirmation() {
  const router = useRouter();

  const handleModalClose = () => {
    router.back();
  };

  return (
    <Modal
      closeModal={handleModalClose}
      title="Warning"
      content={Confirmation()}
    />
  );
}
