import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Icon from 'elementor-app/ui/atoms/icon';

import './loader.scss';

export default function Loader( { absoluteCenter } ) {
	const baseClassName = 'e-app-import-export-loader',
		classes = [ baseClassName, 'eicon-loading eicon-animation-spin' ];

	if ( absoluteCenter ) {
		classes.push( baseClassName + '--absolute-center' );
	}

	return <Icon className={ arrayToClassName( classes ) } />;
}

Loader.propTypes = {
	absoluteCenter: PropTypes.bool,
};

Loader.defaultProps = {
	absoluteCenter: false,
};
