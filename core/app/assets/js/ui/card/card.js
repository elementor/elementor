import './card.scss';

export default function Card( props ) {
	return (
		<article id={ `type-${ props.type }` } className={ `card ${ props.className }` }>
			{ props.children }
		</article>
	);
}

Card.propTypes = {
	type: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any,
};

Card.defaultProps = {
	className: '',
};
