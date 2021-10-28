export default function Icon( props ) {
	return (
		<i className={ `eps-icon ${ props.className }` } { ...props } />
	);
}

Icon.propTypes = {
	className: PropTypes.string.isRequired,
};

Icon.defaultProps = {
	className: '',
};
