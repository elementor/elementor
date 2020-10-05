import './card.scss';

export default function CardHeader( props ) {
	return (
		<header className={ `eps-card__header ${ props.className }` }>
			{ props.children }
		</header>
	);
}

CardHeader.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
};

CardHeader.defaultProps = {
	className: '',
};
