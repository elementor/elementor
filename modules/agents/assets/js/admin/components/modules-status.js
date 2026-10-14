import { AlertCircleIcon, CircleCheckFilledIcon, CircleXFilledIcon, InfoCircleIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const TOTAL_SEGMENTS = 4;
const BAR_HEIGHT = 8;
const BAR_RADIUS = '100px';

const getBarColor = ( index, score ) => {
	if ( 4 === score ) {
		return 'success.main';
	}

	return index < score ? 'warning.main' : 'action.disabled';
};

const getScoreIcon = ( score ) => {
	if ( 4 === score ) {
		return <CircleCheckFilledIcon color="success" fontSize="small" />;
	}

	if ( 0 === score ) {
		return <CircleXFilledIcon color="error" fontSize="small" />;
	}

	return <AlertCircleIcon color="warning" fontSize="small" />;
};

export const ModulesStatus = ( { score, label = __( 'Active', 'elementor' ), showInfoIcon = true, infoIcon } ) => {
	return (
		<Stack alignItems="flex-start" spacing={ 1 } width={ 216 }>
			<Stack direction="row" spacing={ 1 } width="100%">
				{ Array.from( { length: TOTAL_SEGMENTS } ).map( ( _, index ) => (
					<Box
						key={ index }
						flex={ 1 }
						height={ BAR_HEIGHT }
						borderRadius={ BAR_RADIUS }
						bgcolor={ getBarColor( index, score ) }
					/>
				) ) }
			</Stack>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				{ getScoreIcon( score ) }
				<Typography variant="h6" color="text.secondary">
					{ `${ score }/${ TOTAL_SEGMENTS }` }
				</Typography>
				<Stack direction="row" alignItems="center" spacing={ 0.5 }>
					<Typography variant="body2" color="text.secondary">
						{ label }
					</Typography>
					{ showInfoIcon && ( infoIcon ?? <InfoCircleIcon fontSize="small" color="action" /> ) }
				</Stack>
			</Stack>
		</Stack>
	);
};

ModulesStatus.propTypes = {
	score: PropTypes.oneOf( [ 0, 1, 2, 3, 4 ] ).isRequired,
	label: PropTypes.string,
	showInfoIcon: PropTypes.bool,
	infoIcon: PropTypes.node,
};
