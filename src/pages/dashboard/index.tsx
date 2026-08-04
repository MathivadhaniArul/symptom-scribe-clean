import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Note the updated path: ../../schemas/healthMetricSchema
import { healthMetricSchema, HealthMetricInput } from '../../schemas/healthMetricSchema'; 

export default function Dashboard() {
  // Initialize React Hook Form with the Zod resolver
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<HealthMetricInput>({
    resolver: zodResolver(healthMetricSchema),
  });

  // Handle the form submission
  const onSubmit = async (data: HealthMetricInput) => {
    try {
      console.log("Validation passed! Sending to Supabase:", data);
      
      // TODO: Replace this with your actual Supabase submission code
      // const { error } = await supabase.from('health_metrics').insert(data);
      // if (error) throw error;
      
      alert("Metrics logged successfully!");
    } catch (error) {
      console.error("Failed to submit metrics:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard: Log Health Metrics</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* --- STEPS INPUT --- */}
          <div className="flex flex-col gap-1">
            <label htmlFor="steps" className="font-semibold text-gray-700">Steps</label>
            <input 
              id="steps"
              type="number"
              placeholder="e.g., 8000"
              {...register('steps', { valueAsNumber: true })} 
              className={`border p-2 rounded w-full ${errors.steps ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.steps && (
              <span className="text-red-500 text-sm font-medium">{errors.steps.message}</span>
            )}
          </div>

          {/* --- HYDRATION INPUT --- */}
          <div className="flex flex-col gap-1">
            <label htmlFor="hydrationMl" className="font-semibold text-gray-700">Hydration (ml)</label>
            <input 
              id="hydrationMl"
              type="number"
              placeholder="e.g., 2000"
              {...register('hydrationMl', { valueAsNumber: true })} 
              className={`border p-2 rounded w-full ${errors.hydrationMl ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.hydrationMl && (
              <span className="text-red-500 text-sm font-medium">{errors.hydrationMl.message}</span>
            )}
          </div>

          {/* --- CALORIES INPUT --- */}
          <div className="flex flex-col gap-1">
            <label htmlFor="caloriesKcal" className="font-semibold text-gray-700">Calories (kcal)</label>
            <input 
              id="caloriesKcal"
              type="number"
              placeholder="e.g., 2500"
              {...register('caloriesKcal', { valueAsNumber: true })} 
              className={`border p-2 rounded w-full ${errors.caloriesKcal ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.caloriesKcal && (
              <span className="text-red-500 text-sm font-medium">{errors.caloriesKcal.message}</span>
            )}
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Logging...' : 'Log Metrics'}
          </button>

        </form>
      </div>
    </div>
  );
}
