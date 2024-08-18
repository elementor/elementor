import { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@elementor/ui';
const Progress = ( { steps } ) => {
	const [ value, setValue ] = useState( 0 );

	useEffect(()=> {
		let totalSteps = steps.length;
		let doneSteps = steps.filter( i => i.done ).length;
		setValue( doneSteps / totalSteps * 100 )
	}, [] );

	return (
		<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
			<Box sx={ { width: '100%' } }>
				<LinearProgress variant="determinate" value={ value } />
			</Box>
			<Box sx={ { minWidth: 35 } }>
				<Typography variant="body2" color="text.secondary">{ `${ Math.round(
					value ) }%` }</Typography>
			</Box>
		</Box>
	)
}

export default Progress
