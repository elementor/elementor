import * as React from 'react';
import type { ElementType } from 'react';
import { CheckIcon } from '@elementor/icons';
import { Typography } from '@elementor/ui';

import { SelectionBadge } from '../ui/selection-badge';
import { OptionCardRoot } from './styled-components';

interface OptionCardProps {
	label: string;
	icon: ElementType;
	selected: boolean;
	onClick: () => void;
}

export function OptionCard( { label, icon: Icon, selected, onClick }: OptionCardProps ) {
	return (
		<OptionCardRoot
			className={ selected ? 'Mui-selected' : undefined }
			onClick={ onClick }
			aria-pressed={ selected }
		>
			{ selected && <SelectionBadge icon={ CheckIcon } /> }
			<Icon sx={ { fontSize: 32, color: 'text.secondary' } } />
			<Typography variant="body2" color="text.secondary" align="center">
				{ label }
			</Typography>
		</OptionCardRoot>
	);
}
