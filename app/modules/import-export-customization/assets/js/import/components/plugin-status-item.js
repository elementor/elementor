import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Checkbox } from '@elementor/ui';

export default function PluginStatusItem( { name, status } ) {
	return (
		<Box
			display="flex"
			alignItems="center"
			px={ 3 }
			py={ 2 }
		>
			<Checkbox checked disabled sx={ { mr: 2 } } />
			<Typography variant="body1">
				{ name } { status }
			</Typography>
		</Box>
	);
}

PluginStatusItem.propTypes = {
	name: PropTypes.string.isRequired,
	status: PropTypes.string,
};
