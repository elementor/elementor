import * as React from 'react';
import { createVariable } from '@elementor/editor-variables';
import { Button, Stack } from '@elementor/ui';
import { useStylesMigrationContext } from './steps-dialog';

export const VariablesSteps = () => {
    const { variables } = useStylesMigrationContext();

    console.log({variables})


	const handleNext = () => {
		// Logic for next step goes here
	};

	const handlePrevious = () => {
		// Logic for previous step goes here
	};

	return (
		<Stack>
			<Stack>

            </Stack>
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
