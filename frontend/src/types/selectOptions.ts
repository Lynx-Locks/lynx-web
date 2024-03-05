export type Options = Object & {
  label: string,
  value: string,
};

export type SelectType = Options | readonly Options[] | null;