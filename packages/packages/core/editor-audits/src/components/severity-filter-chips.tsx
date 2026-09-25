import * as React from 'react';
import { Box, Chip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditSeverity } from '../types';
import { ALL_SEVERITIES, severityPluralLabel } from '../utils/severity-counts';
import SeverityIcon from './severity-icons';

export type SeverityFilter = 'all' | AuditSeverity;

type Props = {
	selected: SeverityFilter;
	onChange: ( filter: SeverityFilter ) => void;
};

export default function SeverityFilterChips( { selected, onChange }: Props ) {
	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
			<FilterChip
				label={ __( 'All', 'elementor' ) }
				isSelected={ selected === 'all' }
				onClick={ () => onChange( 'all' ) }
			/>
			{ ALL_SEVERITIES.map( ( severity ) => (
				<FilterChip
					key={ severity }
					label={ severityPluralLabel( severity ) }
					icon={ <SeverityIcon severity={ severity } /> }
					isSelected={ selected === severity }
					onClick={ () => onChange( severity ) }
				/>
			) ) }
		</Box>
	);
}

type FilterChipProps = {
	label: string;
	icon?: React.ReactElement;
	isSelected: boolean;
	onClick: () => void;
};

function FilterChip( { label, icon, isSelected, onClick }: FilterChipProps ) {
	return (
		<Chip
			label={ label }
			icon={ icon }
			size="small"
			variant="filled"
			color="default"
			onClick={ onClick }
			aria-pressed={ isSelected }
			sx={ { bgcolor: isSelected ? 'action.selected' : 'transparent' } }
		/>
	);
}
