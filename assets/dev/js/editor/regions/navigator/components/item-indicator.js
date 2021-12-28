import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from 'elementor-app/ui/atoms/icon';

export default function ItemIndicator( { indicator: { title, icon, section }, onActivateSection } ) {
	const indicatorRef = useRef( null );

	useEffect( () => {
		jQuery( indicatorRef.current ).tipsy( { delayIn: 300, gravity: 's' } );
	} );

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
