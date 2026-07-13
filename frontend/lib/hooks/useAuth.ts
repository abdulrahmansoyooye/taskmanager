import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export function useRegister() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post("/api/auth/register", data);
      return res.data;
    },
  });
}
