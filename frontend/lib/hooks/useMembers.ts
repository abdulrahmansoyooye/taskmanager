import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User } from "@/types";

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
  joinedAt: string;
};

export function useMembers(projectId: string) {
  return useQuery<ProjectMember[]>({
    queryKey: ["members", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/api/members/project/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/api/members/project/${projectId}`, { userId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/members/project/${projectId}/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
