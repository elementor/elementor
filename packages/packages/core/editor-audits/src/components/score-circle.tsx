import * as React from 'react';
import { Box, CircularProgress, Typography } from '@elementor/ui';

import { getScoreTier, type ScoreColor } from '../utils/score-thresholds';

type Props = {
	color?: ScoreColor;
	score: number;
};

const SCORE_CIRCLE_SIZE = 88;
const SCORE_CIRCLE_THICKNESS = 3;

export default function ScoreCircle( { color, score }: Props ) {
	const progressColor = color ?? getScoreTier( score ).color;

	return (
		<Box
			role="progressbar"
			aria-valuenow={ score }
			aria-valuemin={ 0 }
			aria-valuemax={ 100 }
			sx={ { position: 'relative', display: 'inline-flex' } }
		>
			<CircularProgress
				variant="determinate"
				value={ 100 }
				size={ SCORE_CIRCLE_SIZE }
				thickness={ SCORE_CIRCLE_THICKNESS }
				sx={ { color: 'action.disabledBackground' } }
			/>
			<CircularProgress
				variant="determinate"
				value={ score }
				size={ SCORE_CIRCLE_SIZE }
				thickness={ SCORE_CIRCLE_THICKNESS }
				color={ progressColor }
				sx={ { position: 'absolute', left: 0 } }
			/>
			<Box
				sx={ {
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				} }
			>
				<Typography
					variant="h4"
					component="span"
					color="text.primary"
					sx={ { fontWeight: 700, lineHeight: 1 } }
				>
					{ score }
				</Typography>
			</Box>
		</Box>
	);
}
