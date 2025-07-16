import * as React from 'react';
import { Button, Stack } from '@elementor/ui';

export const ClassesSteps = () => {
	const handleNext = () => {
		// Logic for next step goes here
	};

	const handlePrevious = () => {
		// Logic for previous step goes here
	};

	return (
		<Stack>
			<Stack></Stack>
			<Stack direction="row" alignItems="center">
				<Button onClick={ handlePrevious } color="secondary">
					Previous
				</Button>
				<Button onClick={ handleNext } variant="contained">
					Next
				</Button>
			</Stack>
		</Stack>
	);
};
