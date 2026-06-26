import * as React from 'react';
import { CheckedCircleIcon } from '@elementor/icons';
import { Stack, Typography } from '@elementor/ui';

import { t } from '../../utils/translations';

export interface FooterHighlightItem {
	labelKey: string;
}

interface FooterHighlightsProps {
	items: readonly FooterHighlightItem[];
	testId?: string;
}

export function FooterHighlights( { items, testId = 'footer-highlights' }: FooterHighlightsProps ) {
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="center"
			gap={ 3 }
			data-testid={ testId }
			sx={ { justifySelf: 'center' } }
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
