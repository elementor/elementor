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
					exit_type?: 'user_exit' | 'unexpected' | null;
					last_active_timestamp?: number | null;
					started_at?: number | null;
					completed_at?: number | null;
				};
				choices: {
					building_for?: string | null;
					site_about?: string[];
					experience_level?: string | null;
					theme_selection?: string | null;
					site_features?: string[];
				};
				hadUnexpectedExit: boolean;
				isConnected: boolean;
				uiTheme?: 'auto' | 'dark' | 'light';
				steps: Array< { id: string; label: string; type?: 'single' | 'multiple' } >;
				urls: {
					dashboard: string;
					editor: string;
					connect: string;
				};
			};
		};
	}
}
