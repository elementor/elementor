import { AlertCircleIcon, CircleCheckFilledIcon, CircleXFilledIcon, InfoCircleIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const SEGMENT_WIDTH = 54;
const BAR_HEIGHT = 8;
const BAR_RADIUS = '100px';

const getBarColor = ( index, score, total ) => {
	if ( total === score ) {
		return 'success.main';
	}

	return index < score ? 'warning.main' : 'action.disabled';
};

const getScoreIcon = ( score, total ) => {
	if ( total === score ) {
		return <CircleCheckFilledIcon color="success" fontSize="small" />;
	}

	if ( 0 === score ) {
		return <CircleXFilledIcon color="error" fontSize="small" />;
	}

	return <AlertCircleIcon color="warning" fontSize="small" />;
};

export const ModulesStatus = ( { score, total, label = __( 'Active', 'elementor' ), showInfoIcon = true, infoIcon } ) => {
	return (
		<Stack alignItems="flex-start" spacing={ 1 } width={ total * SEGMENT_WIDTH }>
			<Stack direction="row" spacing={ 1 } width="100%">
				{ Array.from( { length: total } ).map( ( _, index ) => (
					<Box
						key={ index }
						flex={ 1 }
						height={ BAR_HEIGHT }
						borderRadius={ BAR_RADIUS }
						bgcolor={ getBarColor( index, score, total ) }
					/>
				) ) }
			</Stack>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				{ getScoreIcon( score, total ) }
				<Typography variant="h6" color="text.secondary">
					{ `${ score }/${ total }` }
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
	score: PropTypes.number.isRequired,
	total: PropTypes.number.isRequired,
	label: PropTypes.string,
	showInfoIcon: PropTypes.bool,
	infoIcon: PropTypes.node,
};
