import elementorModules from './common';
import Document from '../frontend/document';

elementorModules.frontend = {
	Document: Document,
	tools: {
		StretchElement: require( 'elementor-frontend/modules/stretch-element' ),
	},
};

export default elementorModules;
