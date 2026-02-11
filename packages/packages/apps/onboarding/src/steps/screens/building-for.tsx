import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Stack, Typography, withDirection } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { GreetingBannerRoot } from '../../components/ui/styled-components';
import { OptionButton } from '../../components/ui/option-button';
import { useOnboarding } from '../../hooks/use-onboarding';

const GREETING_WAVE = '\uD83D\uDC4B';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

const BUILDING_FOR_OPTIONS = [
	{ value: 'myself', label: __( 'Myself or someone I know', 'elementor' ) },
	{ value: 'business', label: __( 'My business or workplace', 'elementor' ) },
	{ value: 'client', label: __( 'A client', 'elementor' ) },
	{ value: 'exploring', label: __( 'Just exploring', 'elementor' ) },
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
			return sprintf(
				/* translators: 1: User's first name, 2: Waving hand emoji. */
				__( "Hey %1$s %2$s Let's get your site set up.", 'elementor' ),
				userName,
				GREETING_WAVE
			);
		}

		return sprintf(
			/* translators: %s: Waving hand emoji. */
			__( "Hey%s Let's get your site set up.", 'elementor' ),
			GREETING_WAVE
		);
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
			<GreetingBannerRoot>
				<Typography variant="body1" color="text.primary" align="center">
					{ greetingText }
				</Typography>
			</GreetingBannerRoot>

			<Stack spacing={ 4 } alignItems="center">
				<Typography variant="h5" align="center">
					{ __( 'Who are you building for?', 'elementor' ) }
				</Typography>

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
								{ option.label }
							</OptionButton>
						);
					} ) }
				</Stack>
			</Stack>
		</Stack>
	);
}
