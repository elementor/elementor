import * as React from 'react';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, type AlertProps } from '@elementor/ui';

export const InfoAlert = ( props: AlertProps ) => (
	<Alert
		icon={ <InfoCircleFilledIcon fontSize="small" color="secondary" /> }
		variant={ 'standard' }
		color="secondary"
		elevation={ 0 }
		size="small"
		{ ...props }
	/>
);
