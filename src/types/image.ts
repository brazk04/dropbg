export type LocalImage = {
  file: File;
  url: string;
  width: number;
  height: number;
};
export type ImageSource = "picker" | "drop" | "clipboard";
export type Notice = { message: string; kind: "success" | "error" | "info" };
