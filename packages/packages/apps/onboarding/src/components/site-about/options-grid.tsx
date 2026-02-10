import * as React from 'react';
import type { ComponentType } from 'react';
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
import type { SvgIconProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { OptionCard } from './option-card';
import { CardGrid } from './styled-components';

interface SiteAboutOption {
	value: string;
	label: string;
	icon: ComponentType< SvgIconProps >;
}

const SITE_ABOUT_OPTIONS: SiteAboutOption[] = [
	{
		value: 'small_business',
		label: __( 'Small business', 'elementor' ),
		icon: BriefcaseIcon as ComponentType< SvgIconProps >,
	},
	{
		value: 'online_store',
		label: __( 'Online store', 'elementor' ),
		icon: CartIcon as ComponentType< SvgIconProps >,
	},
	{
		value: 'company_site',
		label: __( 'Company site', 'elementor' ),
		icon: DomainIcon as ComponentType< SvgIconProps >,
	},
	{ value: 'blog', label: __( 'Blog', 'elementor' ), icon: PostTypeIcon as ComponentType< SvgIconProps > },
	{
		value: 'landing_page',
		label: __( 'Landing page', 'elementor' ),
		icon: LandingPageTemplateIcon as ComponentType< SvgIconProps >,
	},
	{ value: 'booking', label: __( 'Booking', 'elementor' ), icon: CalendarIcon as ComponentType< SvgIconProps > },
	{ value: 'portfolio', label: __( 'Portfolio', 'elementor' ), icon: GridDotsIcon as ComponentType< SvgIconProps > },
	{ value: 'other', label: __( 'Other', 'elementor' ), icon: SearchIcon as ComponentType< SvgIconProps > },
];

interface OptionsGridProps {
	selectedValues: string[];
	onToggle: ( value: string ) => void;
}

export function OptionsGrid( { selectedValues, onToggle }: OptionsGridProps ) {
	return (
		<CardGrid>
			{ SITE_ABOUT_OPTIONS.map( ( option ) => (
				<OptionCard
					key={ option.value }
					label={ option.label }
					icon={ option.icon }
					selected={ selectedValues.includes( option.value ) }
					onClick={ () => onToggle( option.value ) }
				/>
			) ) }
		</CardGrid>
	);
}
