import Utils from 'elementor-app/utils/utils.js';

import Button from 'elementor-app/ui/molecules/button';

import './click-here.scss';

export default function ClickHere( props ) {
	const baseClassName = 'import-export-click-here',
		classes = [ baseClassName, props.className ];

	return (
		<a
			className={ Utils.arrayToClassName( classes ) }
			target="_blank"
			rel="noopener noreferrer"
			href={ props.url }>
			{ __( 'Click here', 'elementor' ) }
		</a>
	);
}

ClickHere.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
};

ClickHere.defaultProps = {
	className: '',
};
