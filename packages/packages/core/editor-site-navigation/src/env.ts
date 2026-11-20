import { parseEnv } from '@elementor/env';

export const { env } = parseEnv< {
	can_access_site_content_panel: boolean;
	is_pages_panel_active: boolean;
} >( '@elementor/editor-site-navigation', ( envData ) => {
	return envData as {
		can_access_site_content_panel: boolean;
		is_pages_panel_active: boolean;
	};
} );
