import { arrayToClassName, pxToRem } from 'elementor-app/utils/utils.js';

import './card.scss';

export default function CardBody( props ) {
	const classNameBase = 'eps-card__body',
		classes = [ classNameBase, props.className ],
		style = {};

	if ( props.hasOwnProperty( 'padding' ) ) {
		style[ '--eps-card-body-padding' ] = pxToRem( props.padding );

		classes.push( classNameBase + '--padding' );
	}

	if ( props.passive ) {
		classes.push( classNameBase + '--passive' );
	}

	if ( props.active ) {
		classes.push( classNameBase + '--active' );
	}

	return (
		<main className={ arrayToClassName( classes ) } style={ style }>
			{ props.children }
		</main>
	);
}

CardBody.propTypes = {
	className: PropTypes.string,
	padding: PropTypes.string,
	passive: PropTypes.bool,
	active: PropTypes.bool,
	children: PropTypes.any.isRequired,
};

CardBody.defaultProps = {
	className: '',
};
