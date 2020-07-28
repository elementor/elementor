import Utils from 'elementor-app/utils/utils.js';

import './notice.scss';

export default function Notice( props ) {
	const baseClassName = 'import-export-notice',
		classes = [ baseClassName, props.className ];

	if ( props.color ) {
		classes.push( baseClassName + '--' + props.color );
	}

	return (
		<div className={ Utils.arrayToClassName( classes ) }>
			{ props.children }
		</div>
	);
}

Notice.propTypes = {
	className: PropTypes.string,
	color: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Notice.defaultProps = {
	className: '',
};
