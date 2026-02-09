import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Box, Stack, styled, Typography, withDirection } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { useOnboarding } from '../../hooks/use-onboarding';
import { useUpdateChoices } from '../../hooks/use-update-choices';

const GREETING_WAVE = '\uD83D\uDC4B';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

const GreetingBanner = styled( Box )( ( { theme } ) => ( {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	paddingInline: theme.spacing( 3 ),
	paddingBlock: theme.spacing( 1.5 ),
	borderRadius: 16,
	backgroundColor: '#fae4fa',
	alignSelf: 'flex-start',
} ) );

interface OptionButtonProps {
	isSelected: boolean;
}

const OptionButton = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected',
} )< OptionButtonProps >( ( { theme, isSelected } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: 56,
	paddingInlineStart: 20,
	paddingInlineEnd: 12,
	paddingBlock: 7,
	borderRadius: theme.shape.borderRadius,
	border: isSelected ? `2px solid ${ theme.palette.text.primary }` : `1px solid ${ theme.palette.divider }`,
	cursor: 'pointer',
	transition: theme.transitions.create( [ 'background-color', 'border-color', 'border-width' ], {
		duration: theme.transitions.duration.shortest,
	} ),
	'& .option-chevron': {
		opacity: isSelected ? 1 : 0,
		transition: theme.transitions.create( 'opacity', {
			duration: theme.transitions.duration.shortest,
		} ),
	},
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
		'& .option-chevron': {
			opacity: 1,
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
			updateChoices.mutate( { building_for: value } );
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
					{ BUILDING_FOR_OPTIONS.map( ( option ) => (
						<OptionButton
							key={ option.value }
							role="button"
							tabIndex={ 0 }
							isSelected={ selectedValue === option.value }
							onClick={ () => handleSelect( option.value ) }
							onKeyDown={ ( e: React.KeyboardEvent ) => {
								if ( e.key === 'Enter' || e.key === ' ' ) {
									e.preventDefault();
									handleSelect( option.value );
								}
							} }
							aria-pressed={ selectedValue === option.value }
						>
							<Typography variant="body1" color="text.secondary" dir="auto">
								{ option.label }
							</Typography>
							<DirectionalChevronIcon className="option-chevron" sx={ { color: 'text.secondary' } } />
						</OptionButton>
					) ) }
				</Stack>
			</Stack>
		</Stack>
	);
}
