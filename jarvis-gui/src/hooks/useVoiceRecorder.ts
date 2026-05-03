import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { api } from "../constants/constant";

export function useVoiceRecorder() {
async function recordAndTranscribe(path: string): Promise<string> {
  const fileData = await readFile(path);
  const blob = new Blob([fileData], { type: "audio/wav" });

  const formData = new FormData();
  formData.append("file", blob, "audio.wav");

  const res = await fetch(`${api}/voice`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.user_text;
}

  return { recordAndTranscribe };
}