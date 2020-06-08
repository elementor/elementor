import './card.scss';

export default function CardHeader( props ) {
	return (
		<header className={ `card__header ${ props.className }` }>
			{ props.children }
		</header>
	);
}

CardHeader.propTypes = {
	className: PropTypes.string,
	children: PropTypes.object.isRequired,
};

CardHeader.defaultProps = {
	className: '',
};
