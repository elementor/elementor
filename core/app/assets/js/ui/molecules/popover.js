import './popover.scss';

export default function Popover( props ) {
	return (
		<ul className={`eps-popover ${ props.className }`}>
			{ props.children }
		</ul>
	);
}

Popover.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};

Popover.defaultProps = {
	className: '',
};
