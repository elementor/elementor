import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, SvgIcon } from '@elementor/ui';

export default function PluginStatusItem( { name, status } ) {
	const isActivated = 'activated' === status;

	return (
		<Box
			display="flex"
			alignItems="center"
			gap={ 1.5 }
		>
			<SvgIcon
				sx={ {
					color: isActivated ? 'text.primary' : 'text.muted',
					fontSize: 20,
				} }
				viewBox="0 0 24 24"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
				/>
			</SvgIcon>
			<Typography variant="body2" color={ isActivated ? 'text.primary' : 'text.muted' }>
				{ name } { status }
			</Typography>
		</Box>
	);
}

PluginStatusItem.propTypes = {
	name: PropTypes.string.isRequired,
	status: PropTypes.string,
};
