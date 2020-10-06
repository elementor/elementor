import EditorBootstrap from 'elementor-tests-qunit/editor/editor-bootstrap';
import FrontendBootstrap from 'elementor-tests-qunit/frontend/frontend-bootstrap';

const { target = 'editor' } = __karma__?.config;

if ( 'editor' === target && ! window.elementor ) {
	new EditorBootstrap();
} else if ( 'frontend' === target && ! window.elementorFrontend ) {
	new FrontendBootstrap();
}
