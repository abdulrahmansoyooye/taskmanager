import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Comment } from "@/types";

export function useComments(taskId: string) {
  return useQuery<Comment[]>({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comments/task/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: string) => {
      const { data } = await api.post(`/api/comments/task/${taskId}`, { comment });
      return data as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}
