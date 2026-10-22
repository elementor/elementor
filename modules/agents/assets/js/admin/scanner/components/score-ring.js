import { useEffect, useId, useState } from 'react';
import Box from '@elementor/ui/Box';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { REDUCED_MOTION_SX, SCANNER_COLORS, SCANNER_LAYOUT, SCANNER_MOTION, SCORE_RING_GRADIENTS } from '../scanner-constants';
import { getScoreTier, READINESS_SCORE_MAX } from '../scanner-score';

const DIMMED_OPACITY = 0.2;
const RADIUS = ( SCANNER_LAYOUT.ringSize - SCANNER_LAYOUT.ringStroke ) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SCANNER_LAYOUT.ringSize / 2;

const clampScore = ( score ) => Math.min( Math.max( score, 0 ), READINESS_SCORE_MAX );

export const ScoreRing = ( { score, durationMs, isDimmed } ) => {
	const gradientId = useId();
	const hasScore = 'number' === typeof score;
	const targetScore = hasScore ? clampScore( score ) : 0;
	const [ drawnScore, setDrawnScore ] = useState( 0 );

	useEffect( () => {
		const frame = window.requestAnimationFrame( () => setDrawnScore( targetScore ) );

		return () => window.cancelAnimationFrame( frame );
	}, [ targetScore ] );

	const gradient = SCORE_RING_GRADIENTS[ getScoreTier( targetScore ) ];
	const dashOffset = CIRCUMFERENCE * ( 1 - ( drawnScore / READINESS_SCORE_MAX ) );
	const label = hasScore
		? sprintf(
			/* Translators: %d: Agent readiness score out of 100. */
			__( 'Agent readiness score: %d out of 100', 'elementor' ),
			targetScore,
		)
		: __( 'Agent readiness score unavailable', 'elementor' );

	return (
		<Box position="relative" width={ SCANNER_LAYOUT.ringSize } height={ SCANNER_LAYOUT.ringSize } flexShrink={ 0 } role="img" aria-label={ label }>
			<svg width={ SCANNER_LAYOUT.ringSize } height={ SCANNER_LAYOUT.ringSize } viewBox={ `0 0 ${ SCANNER_LAYOUT.ringSize } ${ SCANNER_LAYOUT.ringSize }` } aria-hidden="true">
				<defs>
					<linearGradient id={ gradientId } x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor={ gradient.from } />
						<stop offset="100%" stopColor={ gradient.to } />
					</linearGradient>
				</defs>
				<circle cx={ CENTER } cy={ CENTER } r={ RADIUS } fill="none" stroke={ SCANNER_COLORS.ringTrack } strokeWidth={ SCANNER_LAYOUT.ringStroke } />
				<Box
					component="circle"
					cx={ CENTER }
					cy={ CENTER }
					r={ RADIUS }
					fill="none"
					stroke={ `url(#${ gradientId })` }
					strokeWidth={ SCANNER_LAYOUT.ringStroke }
					strokeLinecap="round"
					strokeDasharray={ CIRCUMFERENCE }
					strokeDashoffset={ dashOffset }
					transform={ `rotate(-90 ${ CENTER } ${ CENTER })` }
					sx={ { transition: `stroke-dashoffset ${ durationMs }ms ${ SCANNER_MOTION.easeOutCubic }`, ...REDUCED_MOTION_SX } }
				/>
			</svg>
			<Box
				position="absolute"
				top={ 0 }
				left={ 0 }
				right={ 0 }
				bottom={ 0 }
				display="flex"
				alignItems="center"
				justifyContent="center"
				aria-hidden="true"
				sx={ { opacity: isDimmed ? DIMMED_OPACITY : 1, transition: `opacity ${ SCANNER_MOTION.drawerMs }ms ease-out` } }
			>
				<Box display="flex" flexDirection="column" alignItems="center">
					<Typography variant="h6" component="span" color="text.primary" lineHeight="32px">{ hasScore ? targetScore : '--' }</Typography>
					{ hasScore && (
						<Typography variant="caption" component="span" color="text.disabled" lineHeight="20px">
							{ `/${ READINESS_SCORE_MAX }` }
						</Typography>
					) }
				</Box>
			</Box>
		</Box>
	);
};

ScoreRing.propTypes = {
	score: PropTypes.number,
	durationMs: PropTypes.number.isRequired,
	isDimmed: PropTypes.bool,
};
