import * as React from 'react';
import { Box, Chip, type ChipProps, type Theme, Typography } from '@elementor/ui';

type Props = {
	ariaLabel: string;
	color: ChipProps[ 'color' ];
	count: number;
	label: string;
	onClick: () => void;
};

const COUNT_SUMMARY_CIRCLE_SIZE = 64;
const COUNT_SUMMARY_BORDER_WIDTH = 4;

function chipBorderColor( theme: Theme, color: ChipProps[ 'color' ] ): string {
	if ( color === 'default' || ! color ) {
		return theme.palette.text.secondary;
	}

	return theme.palette[ color ].main;
}

export default function CountSummaryCircle( { ariaLabel, color, count, label, onClick }: Props ) {
	return (
		<Box
			aria-label={ ariaLabel }
			component="button"
			onClick={ onClick }
			type="button"
			sx={ {
				alignItems: 'center',
				background: 'none',
				border: 'none',
				cursor: 'pointer',
				display: 'flex',
				flex: 1,
				flexDirection: 'column',
				gap: 0.5,
				padding: 0,
			} }
		>
			<Chip
				color={ color }
				label={ count }
				size="small"
				variant="standard"
				sx={ ( theme: Theme ) => ( {
					border: `${ COUNT_SUMMARY_BORDER_WIDTH }px solid ${ chipBorderColor( theme, color ) }`,
					borderRadius: '50%',
					height: COUNT_SUMMARY_CIRCLE_SIZE,
					maxWidth: COUNT_SUMMARY_CIRCLE_SIZE,
					width: COUNT_SUMMARY_CIRCLE_SIZE,
					'& .MuiChip-label': {
						fontSize: theme.typography.body2.fontSize,
						fontWeight: 700,
						lineHeight: 1,
						padding: 0,
					},
				} ) }
			/>
			<Typography color="text.secondary" sx={ { textAlign: 'center' } } variant="caption">
				{ label }
			</Typography>
		</Box>
	);
}
