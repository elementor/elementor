import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import { Box, Rotate, Typography, useTheme } from '@elementor/ui';

import { onKeyboardClick } from '../lib/keyboard-click';
import { ALL_SEVERITIES, type SeverityCounts } from '../lib/severity-counts';
import { type AuditCategory } from '../types';
import { CATEGORY_ICONS } from './category-icons';
import SeverityIcon from './severity-icons';

type Props = {
	category: AuditCategory;
	label: string;
	counts: SeverityCounts;
	onClick: () => void;
};

export default function IssuesCategoryRow( { category, label, counts, onClick }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;
	const Icon = CATEGORY_ICONS[ category ];

	return (
		<Box
			role="button"
			tabIndex={ 0 }
			onClick={ onClick }
			onKeyDown={ onKeyboardClick( onClick ) }
			sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				px: 2,
				py: 1.5,
				cursor: 'pointer',
				borderRadius: 1,
				border: 1,
				borderColor: 'divider',
				'&:hover': { bgcolor: 'action.hover' },
				outline: 'none',
				'&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
			} }
		>
			<Icon fontSize="small" color="action" />
			<Typography variant="body2" fontWeight="bold" sx={ { flex: 1 } }>
				{ label }
			</Typography>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
				{ ALL_SEVERITIES.filter( ( s ) => counts[ s ] > 0 ).map( ( severity ) => (
					<Box key={ severity } sx={ { display: 'flex', alignItems: 'center', gap: 0.25 } }>
						<SeverityIcon severity={ severity } />
						<Typography variant="caption" color="text.primary" fontWeight="bold">
							{ counts[ severity ] }
						</Typography>
					</Box>
				) ) }
			</Box>
			<Rotate in={ isRtl }>
				<ChevronRightIcon fontSize="small" color="action" />
			</Rotate>
		</Box>
	);
}
