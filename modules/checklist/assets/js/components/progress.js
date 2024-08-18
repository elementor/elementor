import { Box, LinearProgress, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const Progress = ( { steps } ) => {
	const getProgressPercentage = () => {
		return steps.filter( ( { is_completed } ) => is_completed ).length * 100 / steps.length;
	};

	const progress = getProgressPercentage();

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
			<Box sx={ { width: '100%' } }>
				<LinearProgress variant="determinate" value={ progress } />
			</Box>
			<Box sx={ { minWidth: 35 } }>
				<Typography variant="body2" color="text.secondary">{ `${ Math.round(
					progress) }%` }</Typography>
			</Box>
		</Box>
	);
};

export default Progress;

Progress.propTypes = {
	steps: PropTypes.array.isRequired,
};
