import { BASE_ITEM_CLASS } from './items';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function ItemEdit( { onItemEdit } ) {
	return (
		<div className={ `${ BASE_ITEM_CLASS }__switch` } onClick={ onItemEdit }>
			<Icon className="eicon-edit" />
		</div>
	);
}

ItemEdit.propTypes = {
	onItemEdit: PropTypes.func,
};

export default ItemEdit;
