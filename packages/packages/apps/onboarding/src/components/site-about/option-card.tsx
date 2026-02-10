import * as React from 'react';
import type { ElementType } from 'react';
import { CheckIcon } from '@elementor/icons';
import { Typography } from '@elementor/ui';

import { CheckBadge, OptionCardRoot } from './styled-components';

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
			{ selected && (
				<CheckBadge>
					<CheckIcon sx={ { fontSize: 14, color: 'common.white' } } />
				</CheckBadge>
			) }
			<Icon sx={ { fontSize: 32, color: 'text.secondary' } } />
			<Typography variant="body2" color="text.secondary" align="center">
				{ label }
			</Typography>
		</OptionCardRoot>
	);
}
