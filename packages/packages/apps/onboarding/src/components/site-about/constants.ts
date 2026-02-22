import type { ElementType } from 'react';
import {
	BriefcaseIcon,
	CalendarIcon,
	CartIcon,
	DomainIcon,
	GridDotsIcon,
	LandingPageTemplateIcon,
	PostTypeIcon,
	SearchIcon,
} from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export interface SiteAboutOption {
	value: string;
	label: string;
	icon: ElementType;
}

export const SITE_ABOUT_OPTIONS: SiteAboutOption[] = [
	{ value: 'small_business', label: __( 'Small business', 'elementor' ), icon: BriefcaseIcon },
	{ value: 'online_store', label: __( 'Online store', 'elementor' ), icon: CartIcon },
	{ value: 'company_site', label: __( 'Company site', 'elementor' ), icon: DomainIcon },
	{ value: 'blog', label: __( 'Blog', 'elementor' ), icon: PostTypeIcon },
	{ value: 'landing_page', label: __( 'Landing page', 'elementor' ), icon: LandingPageTemplateIcon },
	{ value: 'booking', label: __( 'Booking', 'elementor' ), icon: CalendarIcon },
	{ value: 'portfolio', label: __( 'Portfolio', 'elementor' ), icon: GridDotsIcon },
	{ value: 'other', label: __( 'Other', 'elementor' ), icon: SearchIcon },
];

export const GREETING_MAP: Record< string, string > = {
	myself: __( "Got it! We'll keep things simple.", 'elementor' ),
	business: __( "Great! Let's set up your business site.", 'elementor' ),
	client: __( "Nice! Let's create something for your client.", 'elementor' ),
	exploring: __( "Got it! We'll keep things simple.", 'elementor' ),
};

export const GREETING_FALLBACK = __( "Let's get started!", 'elementor' );
