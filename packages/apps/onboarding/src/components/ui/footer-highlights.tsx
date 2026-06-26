import * as React from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Stack, type SxProps, type Theme, Typography } from '@elementor/ui';

import { t } from '../../utils/translations';

export interface FooterHighlightItem {
	labelKey: string;
}

interface FooterHighlightsProps {
	items: readonly FooterHighlightItem[];
	testId?: string;
	sx?: SxProps< Theme >;
}

export function FooterHighlights( { items, testId = 'footer-highlights', sx }: FooterHighlightsProps ) {
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			gap={ 3 }
			data-testid={ testId }
			sx={ sx }
		>
			{ items.map( ( item ) => (
				<Stack key={ item.labelKey } direction="row" alignItems="center" gap={ 0.75 }>
					<CheckedCircleIcon fontSize="tiny" sx={ { color: 'text.primary' } } />
					<Typography variant="body2" color="text.secondary">
						{ t( item.labelKey ) }
					</Typography>
				</Stack>
			) ) }
		</Stack>
	);
}
