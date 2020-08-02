import Utils from 'elementor-app/utils/utils.js';

import './box.scss';

export default function Box( props ) {
	const baseClassName = 'eps-box',
		classes = [ baseClassName, props.className ];

	let style;

	if ( props.spacing ) {
		let spacingValues = props.spacing.split( ' ' );

		spacingValues = spacingValues.map( ( value ) => Utils.pxToRem( value ) );

		style = {
			'--eps-box-spacing': spacingValues.join( ' ' ),
		};

		classes.push( baseClassName + '--spacing' );
	}

	return (
		<div style={ style } className={ Utils.arrayToClassName( classes ) }>
			{ props.children }
		</div>
	);
}

Box.propTypes = {
	className: PropTypes.string,
	spacing: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Box.defaultProps = {
	className: '',
};
