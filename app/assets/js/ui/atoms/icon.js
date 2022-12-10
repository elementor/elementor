export default function Icon( props ) {
	return (
		<i className={ `eps-icon ${ props.className }` } />
	);
}

Icon.propTypes = {
	className: PropTypes.string.isRequired,
};

Icon.defaultProps = {
	className: '',
};
