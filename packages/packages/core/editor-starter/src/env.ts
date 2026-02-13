import { parseEnv } from '@elementor/env';

export const { env } = parseEnv< {
	welcome_screen?: {
		show: boolean;
	};
} >( '@elementor/editor-starter', ( envData ) => {
	return envData as {
		welcome_screen?: {
			show: boolean;
		};
	};
} );
