import React, { useState, useEffect, useRef } from 'react';
import { arrayToClassName } from '../utils/utils';

export default function Tooltip( props ) {
	const baseClassName = 'e-app-tooltip',
		classes = [ baseClassName, props.className ],
		childRef = useRef( null ),
		isManualControl = props.hasOwnProperty( 'show' ),
		[ isLibraryLoaded, setIsLibraryLoaded ] = useState( false ),
		[ showTooltip, setShowTooltip ] = useState( false ),
		directionsMap = {
			top: 's',
			right: 'w',
			down: 'n',
			left: 'e',
		},
		tipsyConfig = {
			trigger: isManualControl ? 'manual' : 'hover',
			gravity: directionsMap[ props.direction ],
			offset: props.offset,
			title() {
				return props.title;
			},
		};

	useEffect( () => {
		import(
			/* webpackIgnore: true */
			`${ elementorCommon.config.urls.assets }lib/tipsy/tipsy.min.js?ver=1.0.0`
		).then( () => setIsLibraryLoaded( true ) );
	}, [] );

	useEffect( () => {
		if ( isLibraryLoaded ) {
			const $tooltipContainer = jQuery( childRef.current );

			$tooltipContainer.tipsy( tipsyConfig );

			if ( isManualControl ) {
				const displayMode = props.show ? 'show' : 'hide';

				$tooltipContainer.tipsy( displayMode );
			}
		}
	}, [ isLibraryLoaded, showTooltip ] );

	useEffect( () => {
		if ( props.show !== showTooltip ) {
			setShowTooltip( props.show );
		}
	}, [ props.show ] );

	return (
		<props.tag className={ arrayToClassName( classes ) } ref={ childRef }>
			{ props.children }
		</props.tag>
	);
}

Tooltip.propTypes = {
	className: PropTypes.string,
	offset: PropTypes.number,
	show: PropTypes.bool,
	direction: PropTypes.oneOf( [ 'top', 'right', 'left', 'down' ] ),
	tag: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.any,
};

Tooltip.defaultProps = {
	className: '',
	offset: 10,
	direction: 'top',
};
