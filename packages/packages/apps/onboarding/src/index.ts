export { App } from './components';

declare global {
	interface Window {
		elementorAppConfig?: {
			'e-onboarding'?: {
				version: string;
				restUrl: string;
				nonce: string;
				progress: {
					current_step_id?: string;
					current_step_index?: number;
					completed_steps?: string[];
					exit_type?: string | null;
					last_active_timestamp?: number | null;
					started_at?: number | null;
					completed_at?: number | null;
				};
				choices: Record< string, unknown >;
				hadUnexpectedExit: boolean;
				isConnected: boolean;
				steps: Array< { id: string; label: string } >;
				urls: {
					dashboard: string;
					editor: string;
					connect: string;
				};
			};
		};
	}
}
