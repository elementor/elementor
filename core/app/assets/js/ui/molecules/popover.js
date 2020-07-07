export default function Popover( props ) {
	return (
		<ul className={`eps-popover ${ props.className }`}>
			{ props.children }
		</ul>
	);
}

Popover.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,
};

Popover.defaultProps = {
	className: '',
};
