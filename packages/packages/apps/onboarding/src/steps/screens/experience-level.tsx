import * as React from 'react';
import { useCallback } from 'react';
import { ChevronRightSmallIcon } from '@elementor/icons';
import { Stack, Typography, withDirection } from '@elementor/ui';

import { OptionButton } from '../../components/ui/option-button';
import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { t } from '../../utils/translations';

const DirectionalChevronIcon = withDirection( ChevronRightSmallIcon );

interface ExperienceLevelOption {
	id: string;
	labelKey: string;
}

interface ExperienceLevelProps {
	onComplete: ( choice: Record< string, unknown > ) => void;
}

const OPTIONS: ExperienceLevelOption[] = [
	{ id: 'beginner', labelKey: 'steps.experience_level.option_beginner' },
	{ id: 'intermediate', labelKey: 'steps.experience_level.option_intermediate' },
	{ id: 'advanced', labelKey: 'steps.experience_level.option_advanced' },
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
				<StepTitle variant="h5" align="center" maxWidth={ 325 }>
					{ t( 'steps.experience_level.title' ) }
				</StepTitle>
				<Typography variant="body1" color="text.secondary">
					{ t( 'steps.experience_level.subtitle' ) }
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
							{ t( option.labelKey ) }
						</OptionButton>
					);
				} ) }
			</Stack>
		</Stack>
	);
}
