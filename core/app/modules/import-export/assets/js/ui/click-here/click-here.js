import Utils from 'elementor-app/utils/utils.js';

import './click-here.scss';

export default function ClickHere( props ) {
	const baseClassName = 'import-export-click-here',
		classes = [ baseClassName, props.className ];

	return (
		<a
			className={ Utils.arrayToClassName( classes ) }
			target={ props.target }
			rel="noopener noreferrer"
			href={ props.url }>
			{ __( 'Click Here', 'elementor' ) }
		</a>
	);
}

ClickHere.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
	target: PropTypes.string,
};

ClickHere.defaultProps = {
	className: '',
	target: '_blank',
};
