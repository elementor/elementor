import './badge.scss';

export default function Badge( props ) {
	return (
		<span className={ `eps-badge ${ props.className }` }>
			{ props.children }
		</span>
	);
}

Badge.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};

Badge.defaultProps = {
	className: '',
};
