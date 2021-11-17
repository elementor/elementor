import React from 'react';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export default function ItemIcon( { icon } ) {
	if ( icon ) {
		return (
			<div className="elementor-navigator__element__element-type">
				<Icon className={ icon } />
			</div>
		);
	}

	return null;
}

ItemIcon.propTypes = {
	icon: PropTypes.string,
};
