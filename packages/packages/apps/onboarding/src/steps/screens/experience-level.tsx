import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import { Box, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

interface OptionCardProps {
	isSelected: boolean;
}

interface ExperienceLevelOption {
	id: string;
	label: string;
}

interface ExperienceLevelProps {
	selectedValue?: string | null;
	onSelect: ( value: string ) => void;
}

const OptionCard = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected',
} )< OptionCardProps >( ( { theme, isSelected } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: 56,
	padding: theme.spacing( 0.875, 1.5, 0.875, 2.5 ),
	borderRadius: theme.shape.borderRadius,
	border: isSelected ? `2px solid ${ theme.palette.text.primary }` : `1px solid ${ theme.palette.divider }`,
	cursor: 'pointer',
	transition: 'background-color 0.2s ease',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	'&:hover .chevron-icon': {
		opacity: 1,
	},
} ) );

const ChevronIcon = styled( ChevronRightIcon, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected',
} )< OptionCardProps >( ( { isSelected } ) => ( {
	opacity: isSelected ? 1 : 0,
	transition: 'opacity 0.2s ease',
} ) );

const OPTIONS: ExperienceLevelOption[] = [
	{ id: 'beginner', label: __( "I'm just getting started", 'elementor' ) },
	{ id: 'intermediate', label: __( 'I have some experience', 'elementor' ) },
	{ id: 'advanced', label: __( "I'm very comfortable with Elementor", 'elementor' ) },
];

export function ExperienceLevel( { selectedValue, onSelect }: ExperienceLevelProps ) {
	return (
		<Stack spacing={ 4 } width="100%">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography variant="h5" align="center" sx={ { maxWidth: 300, fontWeight: 500 } }>
					{ __( 'How much experience do you have with Elementor?', 'elementor' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ __( 'This helps us adjust the editor to your workflow.', 'elementor' ) }
				</Typography>
			</Stack>

			<Stack spacing={ 2 }>
				{ OPTIONS.map( ( option ) => (
					<OptionCard
						key={ option.id }
						isSelected={ selectedValue === option.id }
						onClick={ () => onSelect( option.id ) }
					>
						<Typography variant="body1" color="text.secondary">
							{ option.label }
						</Typography>
						<ChevronIcon
							className="chevron-icon"
							isSelected={ selectedValue === option.id }
							fontSize="small"
						/>
					</OptionCard>
				) ) }
			</Stack>
		</Stack>
	);
}
