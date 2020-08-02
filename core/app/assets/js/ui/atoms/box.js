import Utils from 'elementor-app/utils/utils.js';

import './box.scss';

export default function Box( props ) {
	const baseClassName = 'eps-box',
		classes = [ baseClassName, props.className ],
		style = {
			'--eps-box-spacing': Utils.pxToRem( props.spacing ) || 0,
		};

	return (
		<div style={ style } className={ Utils.arrayToClassName( classes ) }>
			{ props.children }
		</div>
	);
}

Box.propTypes = {
	className: PropTypes.string,
	spacing: PropTypes.number,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Box.defaultProps = {
	className: '',
};
