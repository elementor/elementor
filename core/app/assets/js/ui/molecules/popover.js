/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import './popover.scss';

export default function Popover( props ) {
	return (
		<>
			<div className="eps-popover__background" onClick={ props.closeFunction } />
			<ul className={ `eps-popover ${ props.className }` } onClick={ props.closeFunction }>
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
