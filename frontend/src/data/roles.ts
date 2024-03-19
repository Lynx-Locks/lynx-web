import axios from "@/axios/client";
import { Door } from "@/types/door";
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

export const getRolesForUser = async (userId: number): Promise<Options[]> => {
  const resp = await axios.get(`/users/${userId}/roles`);
  const roles: Role[] = resp.data;

  return roles.map((r) => ({
    label: r.name,
    value: r.id.toString(),
  }));
};

export const getDoorOptionsForRole = async (
  roleId: number,
): Promise<Options[]> => {
  const resp = await axios.get(`/roles/${roleId}/doors`);
  const doors: Door[] = resp.data;

  return doors.map((d) => ({
    label: `${d.name} (${d.description})`,
    value: d.id.toString(),
  }));
};
