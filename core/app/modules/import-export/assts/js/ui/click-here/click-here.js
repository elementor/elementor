import Utils from 'elementor-app/utils/utils.js';

import Button from 'elementor-app/ui/molecules/button';

import './click-here.scss';

export default function ClickHere( props ) {
	const baseClassName = 'import-export-click-here',
		classes = [ baseClassName, props.className ];

	return (
		<Button
			variant="underlined"
			color="link"
			className={ Utils.arrayToClassName( classes ) }
			text={ __( 'Click here', 'elementor' ) }
			url={ props.url } />
	);
}

ClickHere.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
};

ClickHere.defaultProps = {
	className: '',
};
