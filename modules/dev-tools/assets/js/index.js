import Deprecation from './deprecation';
import Module from './module';

if ( ! window.elementorDevTools ) {
	window.elementorDevTools = new Module(
		new Deprecation(),
	);

	window.elementorDevTools.notifyBackendDeprecations();
}
