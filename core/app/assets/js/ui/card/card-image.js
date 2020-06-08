import './card.scss';

export default function CardImage( props ) {
	return (
		<figure className={ `card__figure ${ props.className }` }>
			{ props.children }
			<img src={ props.src } alt={ props.alt } className="card__image"/>
		</figure>
	);
}

CardImage.propTypes = {
	className: PropTypes.string,
	src: PropTypes.string.isRequired,
	alt: PropTypes.string.isRequired,
	children: PropTypes.object.isRequired,
};

CardImage.defaultProps = {
	className: '',
};
