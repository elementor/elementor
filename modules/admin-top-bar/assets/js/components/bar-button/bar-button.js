import { useEffect } from 'react';

export default function BarButton( props ) {
	useEffect( () => {
		if ( props.dataInfo ) {
			jQuery( '.top-bar-button-wrapper[data-info]' ).tipsy( {
				title: function() {
					return this.getAttribute( 'data-info' );
				},
				gravity: () => 'n',
				delayIn: 400,
				offset: 1,
			} );
		}
	}, [] );

	return (
		<button className="top-bar-button-wrapper" onClick={props.onClick} data-info={props.dataInfo}>
			<i className={props.icon}></i>
			<h1 className="top-bar-button-title">{ props.children }</h1>
		</button>
	);
}

BarButton.propTypes = {
	children: PropTypes.any,
	dataInfo: PropTypes.string,
	icon: PropTypes.any,
	onClick: PropTypes.func,
};
