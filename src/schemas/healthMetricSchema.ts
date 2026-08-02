import { z } from "zod";

export const healthMetricSchema = z.object({
  steps: z
    .number({ invalid_type_error: "Steps must be a number" })
    .min(0, "Steps cannot be negative")
    .max(100000, "Steps value seems too high — please double-check"),
  hydrationMl: z
    .number({ invalid_type_error: "Hydration must be a number" })
    .min(0, "Hydration cannot be negative")
    .max(10000, "Hydration value seems too high"),
  caloriesKcal: z
    .number({ invalid_type_error: "Calories must be a number" })
    .min(0, "Calories cannot be negative")
    .max(20000, "Calories value seems too high"),
});

export type HealthMetricInput = z.infer<typeof healthMetricSchema>;
