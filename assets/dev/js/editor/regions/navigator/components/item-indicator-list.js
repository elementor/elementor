import ItemIndicator from './item-indicator';
import PropTypes from 'prop-types';

export default function ItemIndicatorList( { settings } ) {
	const list = Object.entries( elementor.navigator.indicators ).map(
		( [ key, indicator ] ) => {
			return indicator.settingKeys.some( ( settingKey ) => settings[ settingKey ] ) &&
				<ItemIndicator key={ key } indicator={ indicator } />;
		}
	);

	return (
		<div className="elementor-navigator__element__indicators">
			{ list }
		</div>
	);
}

ItemIndicatorList.propTypes = {
	settings: PropTypes.object,
};
