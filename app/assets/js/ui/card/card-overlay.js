import './card.scss';

export default function CardOverlay( props ) {
	return (
		<div className={ `eps-card__image-overlay ${ props.className }` }>
			{ props.children }
		</div>
	);
}

CardOverlay.propTypes = {
	className: PropTypes.string,
	children: PropTypes.object.isRequired,
};

CardOverlay.defaultProps = {
	className: '',
};
