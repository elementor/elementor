import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Box, Button, Stack, styled, Typography, withDirection } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useOnboarding } from '../../hooks/use-onboarding';
import { useUpdateChoices } from '../../hooks/use-update-choices';

const GREETING_WAVE = '\uD83D\uDC4B';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

const GREETING_BANNER_BG_COLOR = '#fae4fa';

const GreetingBanner = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: GREETING_BANNER_BG_COLOR,
	alignSelf: 'flex-start',
} ) );

const OptionButton = styled( Button )( ( { theme } ) => ( {
	justifyContent: 'space-between',
	height: 56,
	borderRadius: 8,
	textTransform: 'none',
	fontWeight: theme.typography.body1.fontWeight,
	fontSize: theme.typography.body1.fontSize,
	letterSpacing: theme.typography.body1.letterSpacing,
	lineHeight: theme.typography.body1.lineHeight,
	color: theme.palette.text.secondary,
	borderColor: theme.palette.divider,
	paddingInlineStart: 20,
	paddingInlineEnd: 12,
	'& .MuiButton-endIcon': {
		opacity: 0,
	},
	'&:hover': {
		borderColor: theme.palette.divider,
		'& .MuiButton-endIcon': {
			opacity: 1,
		},
	},
	'&:focus, &:active, &.Mui-focusVisible': {
		outline: 'none',
		backgroundColor: 'transparent',
		borderColor: theme.palette.divider,
	},
	'&.Mui-selected': {
		borderWidth: 2,
		borderColor: theme.palette.text.primary,
		'& .MuiButton-endIcon': {
			opacity: 1,
		},
		'&:hover': {
			borderColor: theme.palette.text.primary,
		},
	},
} ) );

const BUILDING_FOR_OPTIONS = [
	{ value: 'myself', label: __( 'Myself or someone I know', 'elementor' ) },
	{ value: 'business', label: __( 'My business or workplace', 'elementor' ) },
	{ value: 'client', label: __( 'A client', 'elementor' ) },
	{ value: 'exploring', label: __( 'Just exploring', 'elementor' ) },
] as const;

type BuildingForValue = ( typeof BUILDING_FOR_OPTIONS )[ number ][ 'value' ];

interface BuildingForProps {
	onComplete: () => void;
}

export function BuildingFor( { onComplete }: BuildingForProps ) {
	const { userName, isConnected, isGuest, choices, actions } = useOnboarding();
	const updateChoices = useUpdateChoices();

	const selectedValue = choices.building_for;

	const greetingText = useMemo( () => {
		const showName = isConnected && ! isGuest && userName;

		if ( showName ) {
			return sprintf(
				/* translators: 1: User's first name, 2: Waving hand emoji. */
				__( "Hey %1$s %2$s Let's get your site set up.", 'elementor' ),
				userName,
				GREETING_WAVE,
			);
		}

		return sprintf(
			/* translators: %s: Waving hand emoji. */
			__( "Hey%s Let's get your site set up.", 'elementor' ),
			GREETING_WAVE,
		);
	}, [ userName, isConnected, isGuest ] );

	const handleSelect = useCallback(
		async ( value: BuildingForValue ) => {
			actions.setUserChoice( 'building_for', value );
			await updateChoices.mutateAsync( { building_for: value } );
			onComplete();
		},
		[ actions, updateChoices, onComplete ]
	);

	return (
		<Stack spacing={ 7.5 } sx={ { marginTop: -3.5 } } data-testid="building-for-step">
			<GreetingBanner>
				<Typography variant="body1" color="text.primary" align="center">
					{ greetingText }
				</Typography>
			</GreetingBanner>

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
