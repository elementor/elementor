import { useEffect, useRef } from 'react';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function ItemIndicator( { indicator: { title, icon, section }, onActivateSection } ) {
	const indicatorRef = useRef( null );

	useEffect( () => {
		// Show a customized tooltip with the indicator's title, 300ms after it's hovered. This delay is used because
		// of the time it takes for the indicators list animation to appear on hover.
		jQuery( indicatorRef.current ).tipsy( { delayIn: 300, gravity: 's' } );
	} );

	/**
	 * Activate a specific section in the panel according to the indicator that's being clicked.
	 *
	 * @param e Event
	 *
	 * @void
	 */
	const handleClick = ( e ) => {
		e.stopPropagation();
		onActivateSection( section );
	};

	return (
		<div ref={ indicatorRef } className="elementor-navigator__element__indicator" title={ title } onClick={ handleClick }>
			<Icon className={ `eicon-${ icon }` } />
		</div>
	);
}

ItemIndicator.propTypes = {
	indicator: PropTypes.shape( {
		title: PropTypes.string,
		icon: PropTypes.string,
		section: PropTypes.string,
	} ),
	onActivateSection: PropTypes.func,
};

export default ItemIndicator;
