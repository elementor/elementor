import * as React from 'react';
import { useCallback } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Stack, Typography, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { OptionButton } from '../../components/ui/option-button';
import { useOnboarding } from '../../hooks/use-onboarding';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

interface ExperienceLevelOption {
	id: string;
	label: string;
}

interface ExperienceLevelProps {
	onComplete: ( choice: Record< string, unknown > ) => void;
}

const OPTIONS: ExperienceLevelOption[] = [
	{ id: 'beginner', label: __( "I'm just getting started", 'elementor' ) },
	{ id: 'intermediate', label: __( 'I have some experience', 'elementor' ) },
	{ id: 'advanced', label: __( "I'm very comfortable with Elementor", 'elementor' ) },
];

export function ExperienceLevel( { onComplete }: ExperienceLevelProps ) {
	const { choices, actions } = useOnboarding();

	const selectedValue = choices.experience_level;

	const handleSelect = useCallback(
		( value: string ) => {
			actions.setUserChoice( 'experience_level', value );
			onComplete( { experience_level: value } );
		},
		[ actions, onComplete ]
	);

	return (
		<Stack spacing={ 4 } width="100%">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography variant="h5" align="center" fontWeight={ 500 } sx={ { fontFamily: "'Poppins', sans-serif" } }>
					{ __( 'How much experience do you have with Elementor?', 'elementor' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ __( 'This helps us adjust the editor to your workflow.', 'elementor' ) }
				</Typography>
			</Stack>

			<Stack spacing={ 2 }>
				{ OPTIONS.map( ( option ) => {
					const isSelected = selectedValue === option.id;

					return (
						<OptionButton
							key={ option.id }
							variant="outlined"
							fullWidth
							className={ isSelected ? 'Mui-selected' : undefined }
							endIcon={ <DirectionalChevronIcon /> }
							onClick={ () => handleSelect( option.id ) }
							aria-pressed={ isSelected }
						>
							{ option.label }
						</OptionButton>
					);
				} ) }
			</Stack>
		</Stack>
	);
}
