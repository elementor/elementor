import * as React from 'react';
import { useCallback, useMemo } from 'react';
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
import { FeatureGrid, type FeatureOption, ProPlanNotice } from '../components/site-features';

interface SiteFeaturesProps {
	onComplete?: ( choice: Record< string, unknown > ) => void;
}

const EXPLORE_FEATURES_URL = 'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'posts',
		label: __( 'Posts', 'elementor' ),
		Icon: PostTypeIcon,
		isPro: false,
	},
	{
		id: 'pages',
		label: __( 'Pages', 'elementor' ),
		Icon: PageTypeIcon,
		isPro: false,
	},
	{
		id: 'gallery',
		label: __( 'Gallery', 'elementor' ),
		Icon: GridDotsIcon,
		isPro: true,
	},
	{
		id: 'slides',
		label: __( 'Slides', 'elementor' ),
		Icon: SwipeIcon,
		isPro: true,
	},
	{
		id: 'form',
		label: __( 'Form', 'elementor' ),
		Icon: ChecklistIcon,
		isPro: true,
	},
	{
		id: 'hotspot',
		label: __( 'Hotspot', 'elementor' ),
		Icon: MapPinIcon,
		isPro: true,
	},
	{
		id: 'portfolio',
		label: __( 'Portfolio', 'elementor' ),
		Icon: BriefcaseIcon,
		isPro: true,
	},
	{
		id: 'login',
		label: __( 'Login', 'elementor' ),
		Icon: LockFilledIcon,
		isPro: true,
	},
	{
		id: 'mega_menu',
		label: __( 'Mega Menu', 'elementor' ),
		Icon: Menu2Icon,
		isPro: true,
	},
];

const CORE_FEATURE_IDS = new Set( FEATURE_OPTIONS.flatMap( ( option ) => ( option.isPro ? [] : [ option.id ] ) ) );

const STEP_TITLE = __( 'What do you want to include in your site?', 'elementor' );
const STEP_SUBTITLE = __( "We'll use this to tailor suggestions for you.", 'elementor' );

export function SiteFeatures( {}: SiteFeaturesProps ) {
	const { choices, actions } = useOnboarding();

	const storedProFeatures = useMemo( () => ( choices.site_features as string[] ) || [], [ choices.site_features ] );

	const selectedValues = useMemo( () => {
		const combined = [ ...CORE_FEATURE_IDS, ...storedProFeatures ];
		return combined.filter( ( id, index ) => combined.indexOf( id ) === index );
	}, [ storedProFeatures ] );

	const handleFeatureClick = useCallback(
		( id: string ) => {
			if ( CORE_FEATURE_IDS.has( id ) && selectedValues.includes( id ) ) {
				return;
			}

			const isProSelected = storedProFeatures.includes( id );
			const updatedProSelection = isProSelected
				? storedProFeatures.filter( ( featureId ) => featureId !== id )
				: [ ...storedProFeatures, id ];

			actions.setUserChoice( 'site_features', updatedProSelection );
		},
		[ storedProFeatures, selectedValues, actions ]
	);

	const handleExploreMoreClick = useCallback( () => {
		window.open( EXPLORE_FEATURES_URL, '_blank' );
	}, [] );

	return (
		<Stack spacing={ 4 } width="100%">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography
					variant="h5"
					align="center"
					sx={ {
						fontFamily: "'Poppins', sans-serif",
						fontWeight: 500,
					} }
				>
					{ STEP_TITLE }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ STEP_SUBTITLE }
				</Typography>
			</Stack>

			<FeatureGrid
				options={ FEATURE_OPTIONS }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
				onExploreMoreClick={ handleExploreMoreClick }
			/>

			{ storedProFeatures.length > 0 && <ProPlanNotice /> }
		</Stack>
	);
}
