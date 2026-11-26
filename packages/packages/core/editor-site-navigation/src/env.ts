import { parseEnv } from '@elementor/env';

export type PopupsSiteContentEnv = {
	can_use: boolean;
	upgrade_url: string;
};

export const { env } = parseEnv< {
	can_access_site_content_panel: boolean;
	is_pages_panel_active: boolean;
	popups?: PopupsSiteContentEnv;
} >( '@elementor/editor-site-navigation', ( envData ) => {
	return envData as {
		can_access_site_content_panel: boolean;
		is_pages_panel_active: boolean;
		popups?: PopupsSiteContentEnv;
	};
} );
