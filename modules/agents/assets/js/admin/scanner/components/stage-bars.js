import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	getStageHealthLabels,
	getStageLabels,
	getStageQuestions,
	REDUCED_MOTION_SX,
	SCANNER_LAYOUT,
	SCANNER_MOTION,
	STAGE_COMING_SOON_FILL,
	STAGE_HEALTH_COLORS,
} from '../scanner-constants';
import { getStageHealthTier } from '../scanner-score';

const BAR_HEIGHT = 4;
const BAR_RADIUS = '8px';
const COUNT_ROW_GAP = 1;

const getFillRatio = ( stage ) => ( stage.total > 0 ? stage.earned / stage.total : 0 );

const StageBar = ( { stage, label, question } ) => {
	const healthTier = getStageHealthTier( stage );
	const healthColors = healthTier ? STAGE_HEALTH_COLORS[ healthTier ] : null;
	const healthLabel = healthTier ? getStageHealthLabels()[ healthTier ] : '';
	const fillColor = healthColors?.fill ?? STAGE_COMING_SOON_FILL;
	const countLabel = stage.isComingSoon
		? __( 'Coming soon', 'elementor' )
		: sprintf(
			/* Translators: 1: Checks passed in this stage, 2: Total checks in this stage. */
			__( '%1$d / %2$d', 'elementor' ),
			stage.earned,
			stage.total,
		);

	return (
		<Stack spacing={ 1 } flex={ 1 } minWidth={ 0 } pt={ 1 } px={ 1 } pb={ 2 }>
			<Typography variant="overline" color="text.secondary" lineHeight={ 2 }>{ label }</Typography>
			<Box position="relative" height={ BAR_HEIGHT } borderRadius={ BAR_RADIUS } overflow="hidden">
				<Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 } bgcolor={ fillColor } sx={ { opacity: SCANNER_LAYOUT.progressTrackWash } } />
				<Box
					position="relative"
					height="100%"
					width={ `${ getFillRatio( stage ) * 100 }%` }
					bgcolor={ fillColor }
					borderRadius={ BAR_RADIUS }
					sx={ { transition: `width ${ SCANNER_MOTION.ringArriveMs }ms ${ SCANNER_MOTION.easeOutCubic }`, ...REDUCED_MOTION_SX } }
				/>
			</Box>
			<Stack direction="row" alignItems="center" spacing={ COUNT_ROW_GAP }>
				<Typography variant="caption" color="text.disabled">{ countLabel }</Typography>
				{ healthLabel && <Typography variant="caption" color={ healthColors.text }>{ healthLabel }</Typography> }
			</Stack>
			{ question && <Typography variant="caption" color="text.tertiary">{ question }</Typography> }
		</Stack>
	);
};

StageBar.propTypes = {
	stage: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		earned: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
		isComingSoon: PropTypes.bool,
	} ).isRequired,
	label: PropTypes.string.isRequired,
	question: PropTypes.string,
};

export const StageBars = ( { stages } ) => {
	const labels = getStageLabels();
	const questions = getStageQuestions();

	return (
		<Box display="flex" flexWrap="wrap">
			{ stages.map( ( stage ) => (
				<StageBar key={ stage.id } stage={ stage } label={ labels[ stage.id ] } question={ questions[ stage.id ] } />
			) ) }
		</Box>
	);
};

StageBars.propTypes = {
	stages: PropTypes.arrayOf( PropTypes.object ).isRequired,
};
