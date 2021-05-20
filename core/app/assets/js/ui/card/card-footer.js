import { arrayToClassName, pxToRem } from 'elementor-app/utils/utils.js';

import './card.scss';

export default function CardFooter( props ) {
	const classNameBase = 'eps-card__footer',
		classes = [ classNameBase, props.className ],
		style = {};

	if ( props.hasOwnProperty( 'padding' ) ) {
		style[ '--eps-card-footer-padding' ] = pxToRem( props.padding );

		classes.push( classNameBase + '--padding' );
	}

	if ( props.passive ) {
		classes.push( classNameBase + '--passive' );
	}

	if ( props.active ) {
		classes.push( classNameBase + '--active' );
	}

	return (
		<footer className={ arrayToClassName( classes ) } style={ style }>
			{ props.children }
		</footer>
	);
}

CardFooter.propTypes = {
	className: PropTypes.string,
	padding: PropTypes.string,
	passive: PropTypes.bool,
	active: PropTypes.bool,
	children: PropTypes.object.isRequired,
};

CardFooter.defaultProps = {
	className: '',
};
