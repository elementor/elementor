export const ANGIE_MODEL_PREFERENCES = 'angie/modelPreferences' as const;

export interface AngieModelPreferences {
	hints?: Array<{ name: string }>;
	costPriority?: number;           // 0-1 (future use)
	speedPriority?: number;          // 0-1 (future use)
	intelligencePriority?: number;   // 0-1 (future use)
}
