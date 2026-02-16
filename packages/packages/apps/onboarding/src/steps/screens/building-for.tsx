import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Stack, withDirection } from '@elementor/ui';

import { GreetingBanner } from '../../components/ui/greeting-banner';
import { StepTitle } from '../../components/ui/styled-components';
import { OptionButton } from '../../components/ui/option-button';
import { useOnboarding } from '../../hooks/use-onboarding';
import { t } from '../../utils/translations';

const GREETING_WAVE = '\uD83D\uDC4B';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

const BUILDING_FOR_OPTIONS = [
	{ value: 'myself', labelKey: 'steps.building_for.option_myself' },
	{ value: 'business', labelKey: 'steps.building_for.option_business' },
	{ value: 'client', labelKey: 'steps.building_for.option_client' },
	{ value: 'exploring', labelKey: 'steps.building_for.option_exploring' },
] as const;

type BuildingForValue = ( typeof BUILDING_FOR_OPTIONS )[ number ][ 'value' ];

interface BuildingForProps {
	onComplete: ( choice: Record< string, unknown > ) => void;
}

export function BuildingFor( { onComplete }: BuildingForProps ) {
	const { userName, isConnected, isGuest, choices, actions } = useOnboarding();

	const selectedValue = choices.building_for;

	const greetingText = useMemo( () => {
		const showName = isConnected && ! isGuest && userName;

		if ( showName ) {
			return t( 'steps.building_for.greeting_with_name', userName, GREETING_WAVE );
		}

		return t( 'steps.building_for.greeting_without_name', GREETING_WAVE );
	}, [ userName, isConnected, isGuest ] );

	const handleSelect = useCallback(
		( value: BuildingForValue ) => {
			actions.setUserChoice( 'building_for', value );
			onComplete( { building_for: value } );
		},
		[ actions, onComplete ]
	);

	return (
		<Stack spacing={ 7.5 } data-testid="building-for-step">
			<GreetingBanner>{ greetingText }</GreetingBanner>

			<Stack spacing={ 4 } alignItems="center">
				<StepTitle variant="h5" align="center">
					{ t( 'steps.building_for.title' ) }
				</StepTitle>

				<Stack spacing={ 2 } width="100%">
					{ BUILDING_FOR_OPTIONS.map( ( option ) => {
						const isSelected = selectedValue === option.value;

						return (
							<OptionButton
								key={ option.value }
								variant="outlined"
								fullWidth
								className={ isSelected ? 'Mui-selected' : undefined }
								endIcon={ <DirectionalChevronIcon /> }
								onClick={ () => handleSelect( option.value ) }
								aria-pressed={ isSelected }
							>
								{ t( option.labelKey ) }
							</OptionButton>
						);
					} ) }
				</Stack>
			</Stack>
		</Stack>
	);
}
