import { Box, LinearProgress, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import { isStepChecked } from '../../utils/functions';

const Progress = ( { steps } ) => {
	const onlyActionSteps = steps.filter( ( step ) => step.config.id !== 'all_done' );
	const progress = onlyActionSteps.filter( isStepChecked ).length * 100 / onlyActionSteps.length;

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
			<Box sx={ { width: '100%' } }>
				<LinearProgress variant="determinate" value={ progress } />
			</Box>
			<Box sx={ { minWidth: 35 } }>
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
