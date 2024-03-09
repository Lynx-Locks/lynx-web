import axios from "@/axios/client"
import { Role } from "@/types/role";
import { Options } from "@/types/selectOptions";

export const getRoleOptions = async () : Promise<Options[]> => {
	const resp = await axios.get("/doors");
	const roles : Role[] = resp.data;

	return roles.map((r) => ({
		label: r.name,
		value: r.id.toString()
	}));
}