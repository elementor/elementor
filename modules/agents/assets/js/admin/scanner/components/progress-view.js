import { CircleCheckFilledIcon, CircleXFilledIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import CircularProgress from '@elementor/ui/CircularProgress';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	PROGRESS_STEP_ACTIVE,
	PROGRESS_STEP_DONE,
	PROGRESS_STEP_FAILED,
	PROGRESS_STEP_PENDING,
	REDUCED_MOTION_SX,
	SCANNER_COLORS,
	SCANNER_LAYOUT,
	SCANNER_MOTION,
	VISUALLY_HIDDEN_SX,
} from '../scanner-constants';
import { ERROR_HIDDEN_STEP_ID } from '../scanner-mock-data';
import { DottedBackground } from './dotted-background';

const STEP_ICON_SIZE = 16;
const PENDING_DOT_SIZE = 6;
const LABEL_BAR_GAP = 2;
const SECTION_GAP = 4;
const CARD_ROW_GAP = 1;
const ICON_LABEL_GAP = 0.5;

const getStepStatus = ( index, completedStepsCount, isFailed ) => {
	if ( isFailed ) {
		return 0 === index ? PROGRESS_STEP_FAILED : PROGRESS_STEP_DONE;
	}

	if ( index < completedStepsCount ) {
		return PROGRESS_STEP_DONE;
	}

	return index === completedStepsCount ? PROGRESS_STEP_ACTIVE : PROGRESS_STEP_PENDING;
};

const StepIcon = ( { status } ) => {
	if ( PROGRESS_STEP_DONE === status ) {
		return <CircleCheckFilledIcon color="success" sx={ { fontSize: STEP_ICON_SIZE } } />;
	}

	if ( PROGRESS_STEP_FAILED === status ) {
		return <CircleXFilledIcon color="error" sx={ { fontSize: STEP_ICON_SIZE } } />;
	}

	if ( PROGRESS_STEP_ACTIVE === status ) {
		return <CircularProgress size={ STEP_ICON_SIZE } thickness={ 5 } sx={ { color: SCANNER_COLORS.accent } } />;
	}

	return (
		<Box width={ STEP_ICON_SIZE } display="flex" alignItems="center" justifyContent="center">
			<Box width={ PENDING_DOT_SIZE } height={ PENDING_DOT_SIZE } borderRadius="50%" bgcolor="text.tertiary" />
		</Box>
	);
};

StepIcon.propTypes = {
	status: PropTypes.oneOf( [ PROGRESS_STEP_ACTIVE, PROGRESS_STEP_DONE, PROGRESS_STEP_FAILED, PROGRESS_STEP_PENDING ] ).isRequired,
};

export const ProgressView = ( { siteDomain, steps, completedStepsCount, isFailed } ) => {
	const visibleSteps = isFailed ? steps.filter( ( step ) => ERROR_HIDDEN_STEP_ID !== step.id ) : steps;
	const progressRatio = isFailed ? 1 : Math.min( completedStepsCount / steps.length, 1 );
	const activeStep = steps[ completedStepsCount ];
	const liveMessage = isFailed
		? __( 'We couldn\'t reach your site from outside.', 'elementor' )
		: activeStep?.label ?? __( 'Scan complete.', 'elementor' );

	return (
		<Box position="relative" display="flex" alignItems="center" justifyContent="center" width="100%" flex={ 1 } minHeight="100%">
			<DottedBackground />
			<Stack alignItems="center" spacing={ SECTION_GAP } position="relative" zIndex={ 1 } width="100%" px={ 2 }>
				<Stack alignItems="center" spacing={ LABEL_BAR_GAP }>
					<Typography
						component="p"
						m={ 0 }
						color="text.primary"
						sx={ {
							fontSize: SCANNER_LAYOUT.checkingFontSize,
							lineHeight: SCANNER_LAYOUT.checkingLineHeight,
							letterSpacing: SCANNER_LAYOUT.checkingLetterSpacing,
						} }
					>
						{ sprintf(
							/* Translators: %s: Site domain. */
							__( 'Checking %s', 'elementor' ),
							siteDomain,
						) }
					</Typography>
					<Box
						width={ SCANNER_LAYOUT.progressBarWidth }
						height={ SCANNER_LAYOUT.progressBarHeight }
						borderRadius={ SCANNER_LAYOUT.progressBarRadius }
						overflow="hidden"
						position="relative"
						bgcolor={ SCANNER_COLORS.accent }
						role="progressbar"
						aria-valuemin={ 0 }
						aria-valuemax={ 100 }
						aria-valuenow={ Math.round( progressRatio * 100 ) }
						aria-label={ __( 'Scan progress', 'elementor' ) }
					>
						<Box position="absolute" inset={ 0 } bgcolor={ SCANNER_COLORS.paper } sx={ { opacity: SCANNER_LAYOUT.progressTrackWash } } />
						<Box
							position="relative"
							height="100%"
							width={ `${ progressRatio * 100 }%` }
							bgcolor={ SCANNER_COLORS.accent }
							sx={ { transition: `width ${ SCANNER_MOTION.progressBarMs }ms ease-out`, ...REDUCED_MOTION_SX } }
						/>
					</Box>
				</Stack>
				<Stack
					component="ul"
					spacing={ CARD_ROW_GAP }
					width={ SCANNER_LAYOUT.progressCardWidth }
					maxWidth="100%"
					m={ 0 }
					p={ 2 }
					bgcolor={ SCANNER_COLORS.paper }
					border={ 1 }
					borderColor="divider"
					borderRadius={ SCANNER_LAYOUT.cardRadius }
					sx={ { listStyle: 'none' } }
				>
					{ visibleSteps.map( ( step, index ) => {
						const status = getStepStatus( index, completedStepsCount, isFailed );

						return (
							<Stack key={ step.id } component="li" direction="row" alignItems="center" spacing={ ICON_LABEL_GAP } m={ 0 }>
								<StepIcon status={ status } />
								<Typography variant="body2" color={ PROGRESS_STEP_PENDING === status ? 'text.tertiary' : 'text.secondary' }>
									{ step.label }
								</Typography>
							</Stack>
						);
					} ) }
				</Stack>
				<Box aria-live="polite" sx={ VISUALLY_HIDDEN_SX }>{ liveMessage }</Box>
			</Stack>
		</Box>
	);
};

ProgressView.propTypes = {
	siteDomain: PropTypes.string.isRequired,
	steps: PropTypes.arrayOf( PropTypes.shape( {
		id: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
	} ) ).isRequired,
	completedStepsCount: PropTypes.number.isRequired,
	isFailed: PropTypes.bool,
};
