import * as React from 'react';
import { CrownFilledIcon } from '@elementor/icons';
import { Chip } from '@elementor/ui';

export const PromotionChip = React.forwardRef< HTMLDivElement, { onClick: () => void } >(
	( { onClick, ...props }, ref ) => {
		return (
			<Chip
				aria-label="Promotion chip"
				ref={ ref }
				size="tiny"
				color="promotion"
				variant="standard"
				icon={ <CrownFilledIcon /> }
				sx={ {
					ml: 1,
					width: '20px',
					'& .MuiChip-label': {
						display: 'none',
					},
				} }
				onClick={ onClick }
				{ ...props }
			/>
		);
	}
);
