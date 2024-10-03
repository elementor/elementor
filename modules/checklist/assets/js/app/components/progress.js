import { Box, LinearProgress, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import { isStepChecked } from '../../utils/functions';

const Progress = ( { steps } ) => {
	const progress = steps.filter( isStepChecked ).length * 100 / steps.length;

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
			<Box sx={ { width: '100%' } }>
				<LinearProgress variant="determinate" value={ progress } />
			</Box>
			<Box sx={ { width: 'fit-content' } }>
				<Typography variant="body2" color="text.secondary">
					{ `${ Math.round( progress ) }%` }
				</Typography>
			</Box>
		</Box>
	);
};

export default Progress;

Progress.propTypes = {
	steps: PropTypes.array.isRequired,
};
