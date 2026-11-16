export {};

declare global {
	interface Window {
		ElementorAiConfig?: {
			is_get_started?: boolean | string;
		};
	}
}
