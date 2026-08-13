import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import { Box, LinearProgress, Rotate, Typography, useTheme } from '@elementor/ui';

import { onKeyboardClick } from '../utils/keyboard-click';
import { getScoreTier } from '../utils/score-thresholds';

type Props = {
	label: string;
	score: number;
	onClick?: () => void;
};

export default function ScoreBar( { label, score, onClick }: Props ) {
	const isRtl = 'rtl' === useTheme().direction;

	return (
		<Box
			role={ onClick ? 'button' : undefined }
			tabIndex={ onClick ? 0 : undefined }
			onClick={ onClick }
			onKeyDown={ onClick ? onKeyboardClick( onClick ) : undefined }
			sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				cursor: onClick ? 'pointer' : 'default',
				outline: 'none',
				'&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 1 },
				py: 0.5,
			} }
		>
			<Typography variant="body2" sx={ { minWidth: 96 } }>
				{ label }
			</Typography>
			<LinearProgress
				variant="determinate"
				value={ score }
				color={ getScoreTier( score ).color }
				sx={ { flex: 1, height: 6, borderRadius: 4, bgcolor: 'action.disabledBackground' } }
			/>
			<Typography
				variant="body2"
				color="text.primary"
				sx={ { minWidth: 24, textAlign: 'right', fontWeight: 900 } }
			>
				{ score }
			</Typography>
			{ onClick && (
				<Rotate in={ isRtl }>
					<ChevronRightIcon fontSize="small" color="action" />
				</Rotate>
			) }
		</Box>
	);
}
