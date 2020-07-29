export default function Icon( props ) {
	return (
		<i className={ `icon ${ props.className }` }/>
	);
}

Icon.propTypes = {
	className: PropTypes.string.isRequired,
};

Icon.defaultProps = {
	className: '',
};
