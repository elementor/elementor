import type { ElementType } from 'react';
import {
	BriefcaseIcon,
	CalendarIcon,
	CartIcon,
	DomainIcon,
	LandingPageTemplateIcon,
	PostTypeIcon,
	SearchIcon,
} from '@elementor/icons';

import { t } from '../../utils/translations';
import OrganizationIcon from './organization-icon';

export interface SiteAboutOption {
	value: string;
	labelKey: string;
	icon: ElementType;
}

export const SITE_ABOUT_OPTIONS: SiteAboutOption[] = [
	{ value: 'small_business', labelKey: 'steps.site_about.option_small_med_business', icon: BriefcaseIcon },
	{ value: 'online_store', labelKey: 'steps.site_about.option_online_store', icon: CartIcon },
	{ value: 'company_site', labelKey: 'steps.site_about.option_company_site', icon: DomainIcon },
	{ value: 'blog', labelKey: 'steps.site_about.option_blog', icon: PostTypeIcon },
	{ value: 'landing_page', labelKey: 'steps.site_about.option_landing_page', icon: LandingPageTemplateIcon },
	{ value: 'booking', labelKey: 'steps.site_about.option_booking', icon: CalendarIcon },
	{ value: 'organization', labelKey: 'steps.site_about.option_organization', icon: OrganizationIcon },
	{ value: 'other', labelKey: 'steps.site_about.option_other', icon: SearchIcon },
];

export const GREETING_KEY_MAP: Record< string, string > = {
	myself: 'steps.site_about.greeting_myself',
	business: 'steps.site_about.greeting_business',
	client: 'steps.site_about.greeting_client',
	exploring: 'steps.site_about.greeting_myself',
};

export const GREETING_FALLBACK_KEY = 'steps.site_about.greeting_fallback';

export function getGreeting( buildingFor: string ): string {
	const key = GREETING_KEY_MAP[ buildingFor ] ?? GREETING_FALLBACK_KEY;

	return t( key );
}
