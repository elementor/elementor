import * as React from 'react';
import { ChevronRightIcon } from '@elementor/icons';
import { Box, LinearProgress, Typography } from '@elementor/ui';

type Props = {
	label: string;
	score: number;
	onClick?: () => void;
};

const GOOD_THRESHOLD = 90;
const OK_THRESHOLD = 50;

function colorFor( score: number ): 'success' | 'warning' | 'error' {
	if ( score >= GOOD_THRESHOLD ) {
		return 'success';
	}

	if ( score >= OK_THRESHOLD ) {
		return 'warning';
	}

	return 'error';
}

export default function ScoreBar( { label, score, onClick }: Props ) {
	return (
		<Box
			role={ onClick ? 'button' : undefined }
			tabIndex={ onClick ? 0 : undefined }
			onClick={ onClick }
			onKeyDown={ ( event ) => {
				if ( onClick && ( event.key === 'Enter' || event.key === ' ' ) ) {
					onClick();
				}
			} }
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
				color={ colorFor( score ) }
				sx={ { flex: 1, height: 8, borderRadius: 4 } }
			/>
			<Typography variant="body2" color="text.primary" sx={ { minWidth: 24, textAlign: 'right', fontWeight: 900 } }>
				{ score }
			</Typography>
			{ onClick && <ChevronRightIcon fontSize="small" color="action" /> }
		</Box>
	);
}
