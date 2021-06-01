import { useEffect } from 'react';

export default function BarButton( props ) {
	useEffect( () => {
		if ( props.dataInfo ) {
			jQuery( '.elementor-admin-top-bar__bar-button[data-info]' ).tipsy( {
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
		<a className="elementor-admin-top-bar__bar-button" ref={props.buttonRef} onClick={props.onClick} data-info={props.dataInfo} href={props.href}>
			<i className= {`elementor-admin-top-bar__bar-button-icon ${ props.icon }`} />
			<h1 className="elementor-admin-top-bar__bar-button-title">{ props.children }</h1>
		</a>
	);
}

BarButton.propTypes = {
	children: PropTypes.any,
	dataInfo: PropTypes.string,
	icon: PropTypes.any,
	onClick: PropTypes.func,
	buttonRef: PropTypes.object,
	href: PropTypes.string,
};
