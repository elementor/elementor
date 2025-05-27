/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import './popover.scss';

export default function Popover( props ) {
	const getArrowPositionClass = () => {
		switch (props.arrowPosition) {
			case 'start':
				return 'eps-popover--arrow-start';
			case 'end': 
				return 'eps-popover--arrow-end';
			case 'none':
				return 'eps-popover--arrow-none';
			default:
				return 'eps-popover--arrow-center';
		}
	};

	return (
		<>
			<div className="eps-popover__background" onClick={ props.closeFunction } />
			<ul className={ `eps-popover ${ getArrowPositionClass() } ${ props.className }` } onClick={ props.closeFunction }>
				{ props.children }
			</ul>
		</>
	);
}

Popover.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
	closeFunction: PropTypes.func,
	arrowPosition: PropTypes.oneOf( [ 'start', 'center', 'end', 'none' ] ),
};

Popover.defaultProps = {
	className: '',
	arrowPosition: 'center',
};
