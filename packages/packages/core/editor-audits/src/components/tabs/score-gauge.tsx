import * as React from 'react';
import { Box, CircularProgress, Typography } from '@elementor/ui';

type Props = {
	score: number;
	label: string;
	size?: number;
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

export default function ScoreGauge( { score, label, size = 96, onClick }: Props ) {
	return (
		<Box
			role={ onClick ? 'button' : undefined }
			tabIndex={ onClick ? 0 : -1 }
			onClick={ onClick }
			onKeyDown={ ( event ) => {
				if ( onClick && ( event.key === 'Enter' || event.key === ' ' ) ) {
					onClick();
				}
			} }
			aria-label={ `${ label } ${ score } of 100` }
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 0.5,
				cursor: onClick ? 'pointer' : 'default',
				outline: 'none',
				'&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 1 },
			} }
		>
			<Box sx={ { position: 'relative', display: 'inline-flex' } }>
				<CircularProgress
					variant="determinate"
					value={ 100 }
					size={ size }
					thickness={ 4 }
					sx={ { color: 'action.disabledBackground' } }
				/>
				<CircularProgress
					variant="determinate"
					value={ score }
					size={ size }
					thickness={ 4 }
					color={ colorFor( score ) }
					sx={ { position: 'absolute', insetInlineStart: 0 } }
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
					<Typography variant="subtitle1" component="span">
						{ score }
					</Typography>
				</Box>
			</Box>
			<Typography variant="caption">{ label }</Typography>
		</Box>
	);
}
