"use client";

import Modal from "@/components/modal/modal";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/axios/client";
import User from "@/types/user";
import SearchDropdown from "@/components/searchDropdown/searchDropdown";
import { Options, SelectType } from "@/types/selectOptions";

export default function EditSelectionModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disabled, setDisabled] = useState(false);
  const [users, setUsers] = useState<Options[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectType>(null);

  useEffect(() => {
    const f = async () => {
      const usersResp = await axios.get("/users", {
        params: {
          users: searchParams.get("users"),
        },
      });
      setUsers(
        usersResp.data.map((user: User) => ({
          label: user.email,
          value: user.id.toString(),
        })),
      );
      setSelectedUsers(
        usersResp.data.map((user: User) => ({
          label: user.email,
          value: user.id.toString(),
        })),
      );
    };
    f();
  }, [searchParams]);

  const handleModalSubmit = async () => {
    setDisabled(true);

    router.push("/admin");
  };

  const handleModalClose = () => {
    router.push("/admin");
  };

  const editSelectionModalContent = (
    <div>
      <SearchDropdown
        defaultValue={Array.isArray(selectedUsers) ? selectedUsers : []}
        options={users}
        placeholder="Select User(s)..."
        subheader="Users"
        selectDropdown="tableModal"
        setSelectedOption={setSelectedUsers}
        isMulti
      />
    </div>
  );

  return (
    <Modal
      closeModal={handleModalClose}
      title="Edit Selected Users"
      content={editSelectionModalContent}
    />
  );
}
