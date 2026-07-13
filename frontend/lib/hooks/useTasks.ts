import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Task, TaskStatus } from "@/types";

export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/projects/${projectId}/tasks`);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useAssignedTasks() {
  return useQuery<Task[]>({
    queryKey: ["assignedTasks"],
    queryFn: async () => {
      const { data } = await api.get("/api/tasks");
      return data;
    },
  });
}

export function useTask(taskId: string) {
  return useQuery<Task>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: {
      title: string;
      description?: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      dueDate: string;
      assignedTo?: string;
    }) => {
      const { data } = await api.post(`/api/tasks/projects/${projectId}/tasks`, taskData);
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useUpdateTask(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskData: Record<string, unknown>) => {
      const { data } = await api.patch(`/api/tasks/${taskId}`, taskData);
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const { data } = await api.patch(`/api/tasks/${taskId}/status`, { status });
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", data.id] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}
