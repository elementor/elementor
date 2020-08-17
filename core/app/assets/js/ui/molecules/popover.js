import './popover.scss';

export default function Popover( props ) {
	return (
		<>
			<div className="eps-popover__background" onClick={ props.closeFunction }/>
			<ul className={`eps-popover ${ props.className }`} onClick={ props.closeFunction }>
				{ props.children }
			</ul>
		</>
	);
}

Popover.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
	closeFunction: PropTypes.func,
};

Popover.defaultProps = {
	className: '',
};
