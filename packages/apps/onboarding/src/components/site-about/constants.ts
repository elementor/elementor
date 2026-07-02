import type { ElementType } from 'react';

import {
	BlogIcon,
	BookingIcon,
	CompanySiteIcon,
	LandingPageIcon,
	OnlineStoreIcon,
	OrganizationIcon,
	OtherIcon,
	SmallMedBusinessIcon,
} from '../../icons';
import { t } from '../../utils/translations';

export interface SiteAboutOption {
	value: string;
	labelKey: string;
	icon: ElementType;
}

export const SITE_ABOUT_OPTIONS: SiteAboutOption[] = [
	{ value: 'small_business', labelKey: 'steps.site_about.option_small_med_business', icon: SmallMedBusinessIcon },
	{ value: 'online_store', labelKey: 'steps.site_about.option_online_store', icon: OnlineStoreIcon },
	{ value: 'company_site', labelKey: 'steps.site_about.option_company_site', icon: CompanySiteIcon },
	{ value: 'blog', labelKey: 'steps.site_about.option_blog', icon: BlogIcon },
	{ value: 'landing_page', labelKey: 'steps.site_about.option_landing_page', icon: LandingPageIcon },
	{ value: 'booking', labelKey: 'steps.site_about.option_booking', icon: BookingIcon },
	{ value: 'organization', labelKey: 'steps.site_about.option_organization', icon: OrganizationIcon },
	{ value: 'other', labelKey: 'steps.site_about.option_other', icon: OtherIcon },
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
