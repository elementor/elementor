import * as React from 'react';
import { useMemo } from 'react';
import { Stack, Typography, useTheme } from '@elementor/ui';

import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { t } from '../../utils/translations';
import { CORE_FEATURE_IDS, FEATURE_OPTIONS, FeatureGrid } from '../components/site-features';

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

export function SiteFeatures() {
	const { choices, actions } = useOnboarding();

	const theme = useTheme();

	const rawSiteFeatures = choices.site_features as string[] | undefined;

	const storedSelectableFeatures = useMemo(
		() =>
			( rawSiteFeatures || [] ).filter( ( id ) => FEATURE_OPTION_IDS.has( id ) && ! CORE_FEATURE_IDS.has( id ) ),
		[ rawSiteFeatures ]
	);

	const selectedValues = useMemo( () => {
		const combined = [ ...CORE_FEATURE_IDS, ...storedSelectableFeatures ];
		return combined.filter( ( id, index ) => combined.indexOf( id ) === index );
	}, [ storedSelectableFeatures ] );

	function handleFeatureClick( id: string ) {
		if ( CORE_FEATURE_IDS.has( id ) ) {
			return;
		}

		const isCurrentlySelected = storedSelectableFeatures.includes( id );
		const updatedSelectableFeatures = isCurrentlySelected
			? storedSelectableFeatures.filter( ( featureId ) => featureId !== id )
			: [ ...storedSelectableFeatures, id ];

		actions.setUserChoice( 'site_features', updatedSelectableFeatures );
	}

	return (
		<Stack spacing={ 4 } width="100%" data-testid="site-features-step">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<StepTitle color="text.primary" variant="h5" align="center" paddingBlockStart={ theme.spacing( 2.5 ) }>
					{ t( 'steps.site_features.title' ) }
				</StepTitle>
				<Typography variant="body1" color="text.secondary">
					{ t( 'steps.site_features.subtitle' ) }
				</Typography>
			</Stack>

			<FeatureGrid
				options={ FEATURE_OPTIONS }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
			/>
		</Stack>
	);
}
