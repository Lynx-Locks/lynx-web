import axios from "@/axios/client";
import { Role } from "@/types/role";
import { Options } from "@/types/selectOptions";

export const getRoleOptions = async (): Promise<Options[]> => {
  const resp = await axios.get("/roles");
  const roles: Role[] = resp.data;

  return roles.map((r) => ({
    label: r.name,
    value: r.id.toString(),
  }));
};

export const getUserRoles = async (userId: number): Promise<Options[]> => {
  const resp = await axios.get(`/users/${userId}/roles`);
  const roles: Role[] = resp.data;

  return roles.map((r) => ({
    label: r.name,
    value: r.id.toString(),
  }));
};
