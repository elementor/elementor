import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
	BriefcaseIcon,
	GridDotsIcon,
	ListIcon,
	LockFilledIcon,
	MapPinIcon,
	Menu2Icon,
	MessageLinesIcon,
	RepeatIcon,
	SwipeIcon,
} from '@elementor/icons';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { FeatureGrid, type FeatureOption, ProPlanNotice } from '../../components/screens/site-features';

interface SiteFeaturesProps {
	selectedValues: string[];
	onChange: ( values: string[] ) => void;
}

const EXPLORE_FEATURES_URL = 'https://elementor.com/features/?utm_source=onboarding&utm_medium=wp-dash';

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
		label: __( 'Posts', 'elementor' ),
		Icon: ListIcon,
	},
	{
		id: 'form',
		label: __( 'Form', 'elementor' ),
		Icon: MessageLinesIcon,
		isPro: true,
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
		isPro: false,
	},
	{
		id: 'loop_carousel',
		label: __( 'Loop carousel', 'elementor' ),
		Icon: RepeatIcon,
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
		label: __( 'Mega menu', 'elementor' ),
		Icon: Menu2Icon,
		isPro: true,
	},
];

const PRO_FEATURE_IDS = new Set( FEATURE_OPTIONS.filter( ( option ) => option.isPro ).map( ( option ) => option.id ) );

export function SiteFeatures( { selectedValues, onChange }: SiteFeaturesProps ) {
	const handleFeatureClick = useCallback(
		( id: string ) => {
			const isSelected = selectedValues.includes( id );
			const nextValues = isSelected ? selectedValues.filter( ( v ) => v !== id ) : [ ...selectedValues, id ];

			onChange( nextValues );
		},
		[ selectedValues, onChange ]
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
					{ __( 'What do you want to include in your site?', 'elementor' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ __( "We'll use this to tailor suggestions for you.", 'elementor' ) }
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
