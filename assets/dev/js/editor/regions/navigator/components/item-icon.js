import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function ItemIcon( { icon } ) {
	if ( icon ) {
		return (
			<div className="elementor-navigator__element__element-type" role="item-icon">
				<Icon className={ icon } />
			</div>
		);
	}

	return null;
}

ItemIcon.propTypes = {
	icon: PropTypes.string,
};

export default ItemIcon;
