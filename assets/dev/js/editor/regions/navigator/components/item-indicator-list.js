import ItemIndicator from './item-indicator';
import PropTypes from 'prop-types';

export function ItemIndicatorList( { settings, onActivateSection } ) {
	/**
	 * Generate a list of indicator elements by checking whether the element contains settings that are suppose to
	 * result in an indicator on the navigator.
	 *
	 * @type {ItemIndicator[]}
	 */
	const list = Object.entries( elementor.navigator.region.indicators ).map(
		( [ key, indicator ] ) => {
			return indicator.settingKeys.some( ( settingKey ) => settings[ settingKey ] ) &&
				<ItemIndicator key={ key } indicator={ indicator } onActivateSection={ onActivateSection } />;
		}
	);

	return (
		<div className="elementor-navigator__element__indicators" data-testid="item-indicator-list">
			{ list }
		</div>
	);
}

ItemIndicatorList.propTypes = {
	settings: PropTypes.object,
	onActivateSection: PropTypes.func,
};

export default ItemIndicatorList;
