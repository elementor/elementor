import './card.scss';

const Card = React.forwardRef( ( props, ref ) => {
	return (
		<article className={ `eps-card ${ props.className }` } ref={ ref }>
			{ props.children }
		</article>
	);
} );

Card.propTypes = {
	type: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any,
};

Card.defaultProps = {
	className: '',
};

Card.displayName = 'Card';

export default Card;
