import * as React from 'react';

import PopupsSiteContentSection from './components/panel/popups/popups-site-content-section';
import { POPUPS_SITE_CONTENT_SECTION_ID } from './popups/constants';
import { registerSiteContentSection } from './site-content-sections';

const POPUPS_SITE_CONTENT_SECTION_PRIORITY = 100;

export function registerPopupsSiteContentSection() {
	registerSiteContentSection( {
		id: POPUPS_SITE_CONTENT_SECTION_ID,
		priority: POPUPS_SITE_CONTENT_SECTION_PRIORITY,
		render: () => <PopupsSiteContentSection />,
	} );
}
