import { parseEnv } from '@elementor/env';

export const { env } = parseEnv< {
	is_pages_panel_active: boolean;
} >( '@elementor/editor-site-navigation', ( envData ) => {
	return envData as {
		is_pages_panel_active: boolean;
	};
} );
