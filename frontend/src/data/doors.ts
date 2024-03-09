import axios from "@/axios/client";
import { Door } from "@/types/door";
import { Options } from "@/types/selectOptions";

export const getDoorOptions = async (): Promise<Options[]> => {
  const resp = await axios.get("/doors");
  const doors: Door[] = resp.data;

  return doors.map((d) => ({
    label: `${d.name} (${d.description})`,
    value: d.id.toString(),
  }));
};
