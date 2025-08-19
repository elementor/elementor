import { useEffect } from 'react';

export default function BarButton( props ) {
	useEffect( () => {
		if ( props.dataInfo ) {
			jQuery( '.e-admin-top-bar__bar-button[data-info]' ).tipsy( {
				title() {
					return this.getAttribute( 'data-info' );
				},
				gravity: () => 'n',
				delayIn: 400,
				offset: 1,
			} );
		}
	}, [] );

	return (
		<a className={ `e-admin-top-bar__bar-button ${ props.additionalClasses }` } ref={ props.buttonRef } onClick={ props.onClick } data-info={ props.dataInfo } href={ props.href } target={ props.target }>
			<i className={ `e-admin-top-bar__bar-button-icon ${ props.icon } ${ props.iconAdditionalClasses }` } />
			<span className="e-admin-top-bar__bar-button-title">{ props.children }</span>
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
	target: PropTypes.string,
	additionalClasses: PropTypes.string,
	iconAdditionalClasses: PropTypes.string,
};
