import './icon.scss';

export default function Icon( props ) {
	return (
		<i className={ `icon ${ props.className }` }></i>
	);
}

Icon.propTypes = {
	className: PropTypes.string.isRequired,
};

Icon.defaultProps = {
	className: '',
};
