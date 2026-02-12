import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import {
	BriefcaseIcon,
	ChecklistIcon,
	GridDotsIcon,
	LockFilledIcon,
	MapPinIcon,
	Menu2Icon,
	PageTypeIcon,
	PostTypeIcon,
	SwipeIcon,
} from '@elementor/icons';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useOnboarding } from '../../hooks/use-onboarding';
import {
	FeatureGrid,
	type FeatureOption,
	ProPlanNotice,
} from '../components/site-features';

interface SiteFeaturesProps {
	onComplete?: ( choice: Record< string, unknown > ) => void;
}

const EXPLORE_FEATURES_URL =
	'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash';

const STEP_TITLE_SX = {
	color: '#0C0D0E',
	textAlign: 'center',
	fontFamily: "'Poppins', sans-serif",
	fontSize: 24,
	fontWeight: 500,
	lineHeight: 1.33,
	letterSpacing: 0,
	fontFeatureSettings: "'liga' off, 'clig' off",
};

const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'posts',
		label: __( 'Core feature', 'elementor' ),
		Icon: PostTypeIcon,
		isPro: false,
	},
	{
		id: 'pages',
		label: __( 'Core feature', 'elementor' ),
		Icon: PageTypeIcon,
		isPro: false,
	},
	{
		id: 'gallery',
		label: __( 'Pro/One', 'elementor' ),
		Icon: GridDotsIcon,
		isPro: true,
	},
	{
		id: 'slides',
		label: __( 'Pro/One', 'elementor' ),
		Icon: SwipeIcon,
		isPro: true,
	},
	{
		id: 'form',
		label: __( 'Pro/One', 'elementor' ),
		Icon: ChecklistIcon,
		isPro: true,
	},
	{
		id: 'hotspot',
		label: __( 'Pro/One', 'elementor' ),
		Icon: MapPinIcon,
		isPro: true,
	},
	{
		id: 'portfolio',
		label: __( 'Pro/One', 'elementor' ),
		Icon: BriefcaseIcon,
		isPro: true,
	},
	{
		id: 'login',
		label: __( 'Pro/One', 'elementor' ),
		Icon: LockFilledIcon,
		isPro: true,
	},
	{
		id: 'mega_menu',
		label: __( 'Pro/One', 'elementor' ),
		Icon: Menu2Icon,
		isPro: true,
	},
];

const PRO_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.filter( ( option ) => option.isPro ).map(
		( option ) => option.id
	)
);

const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.filter( ( option ) => ! option.isPro ).map(
		( option ) => option.id
	)
);

export function SiteFeatures( _props: SiteFeaturesProps ) {
	const { choices, actions } = useOnboarding();

	const selectedValues = useMemo( () => {
		const stored = ( choices.site_features as string[] ) || [];
		return [ ...new Set( [ ...CORE_FEATURE_IDS, ...stored ] ) ];
	}, [ choices.site_features ] );

	useEffect( () => {
		const stored = ( choices.site_features as string[] ) || [];
		const hasAllCore = [ ...CORE_FEATURE_IDS ].every( ( id ) =>
			stored.includes( id )
		);
		if ( ! hasAllCore ) {
			const merged = [ ...new Set( [ ...CORE_FEATURE_IDS, ...stored ] ) ];
			actions.setUserChoice( 'site_features', merged );
		}
	}, [ choices.site_features, actions ] );

	const handleFeatureClick = useCallback(
		( id: string ) => {
			const isSelected = selectedValues.includes( id );
			const isCore = CORE_FEATURE_IDS.has( id );

			if ( isCore && isSelected ) {
				return;
			}

			const nextValues = isSelected
				? selectedValues.filter( ( v ) => v !== id )
				: [ ...selectedValues, id ];

			actions.setUserChoice( 'site_features', nextValues );
		},
		[ selectedValues, actions ]
	);

	const hasProSelection = useMemo(
		() => selectedValues.some( ( id ) => PRO_FEATURE_IDS.has( id ) ),
		[ selectedValues ]
	);

	const handleExploreMoreClick = useCallback( () => {
		window.open( EXPLORE_FEATURES_URL, '_blank' );
	}, [] );

	return (
		<Stack spacing={ 4 } width="100%" sx={ { mb: '100px' } }>
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography component="h2" sx={ STEP_TITLE_SX }>
					{ __(
						'What do you want to include in your site?',
						'elementor'
					) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ __(
						"We'll use this to tailor suggestions for you.",
						'elementor'
					) }
				</Typography>
			</Stack>

			<FeatureGrid
				options={ FEATURE_OPTIONS }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
				onExploreMoreClick={ handleExploreMoreClick }
			/>

			{ hasProSelection && <ProPlanNotice /> }
		</Stack>
	);
}
