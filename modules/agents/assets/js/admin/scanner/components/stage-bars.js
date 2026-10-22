import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	getStageLabels,
	getStageQuestions,
	REDUCED_MOTION_SX,
	SCANNER_LAYOUT,
	SCANNER_MOTION,
	STAGE_ACT,
	STAGE_COMMERCE,
	STAGE_IDENTIFY,
	STAGE_REACH,
} from '../scanner-constants';

const BAR_HEIGHT = 4;
const BAR_RADIUS = '8px';

const STAGE_FILL_COLORS = {
	[ STAGE_REACH ]: 'success.light',
	[ STAGE_IDENTIFY ]: 'warning.light',
	[ STAGE_ACT ]: 'error.light',
	[ STAGE_COMMERCE ]: 'action.disabled',
};

const getFillRatio = ( stage ) => ( stage.total > 0 ? stage.earned / stage.total : 0 );

const StageBar = ( { stage, label, question } ) => {
	const fillColor = STAGE_FILL_COLORS[ stage.id ];
	const countLabel = stage.isComingSoon
		? __( 'Coming soon', 'elementor' )
		: sprintf(
			/* Translators: 1: Points earned in this stage, 2: Points available in this stage. */
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
			<Typography variant="caption" color="text.disabled">{ countLabel }</Typography>
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
