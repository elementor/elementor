import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Stack, Chip, Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { TextNode } from './opt-in-content';

const i18n = {
	title: __( 'Editor V4', 'elementor' ),
	chip: __( 'Alpha', 'elementor' ),
};

export const OptInPopover = ( { children, onClose, anchorEl } ) => {
	return (
		<Popover
			open
			onClose={ onClose }
			anchorEl={ anchorEl }
			anchorOrigin={ { vertical: 'center', horizontal: 'center' } }
			transformOrigin={ { vertical: 'center', horizontal: 'center' } }
			slotProps={ {
				paper: {
					sx: { width: 600 },
				} } }
		>
			<Stack direction="row" alignItems="center" gap={ 1 } p={ 1.5 } px={ 3 } >
				<i className="eicon-elementor-circle" style={ { fontSize: '24px' } } />
				<TextNode variant="subtitle1" width="fit-content">{ i18n.title }</TextNode>
				<Chip size="small" color="secondary" variant="filled" label={ i18n.chip } />
			</Stack>

			<Stack gap={ 2 } pb={ 2 } >
				<Divider />
				{ children }
			</Stack>
		</Popover>
	);
};

OptInPopover.propTypes = {
	children: PropTypes.node,
	onClose: PropTypes.func.isRequired,
	anchorEl: PropTypes.object,
};
