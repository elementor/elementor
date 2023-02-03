import Accordion from './handlers/accordion';
import Alert from './handlers/alert';
import Counter from './handlers/counter';
import Progress from './handlers/progress';
import Tabs from './handlers/tabs';
import Toggle from './handlers/toggle';
import Video from './handlers/video';
import ImageCarousel from './handlers/image-carousel';
import TextEditor from './handlers/text-editor';

import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';

import LightboxModule from 'elementor-frontend/utils/lightbox/lightbox';

elementorFrontend.elements.$window.on( 'elementor/frontend/init', () => {
	elementorFrontend.elementsHandler.elementsHandlers = {
		'accordion.default': Accordion,
		'alert.default': Alert,
		'counter.default': Counter,
		'progress.default': Progress,
		'tabs.default': Tabs,
		'nested-tabs.default': NestedTabs,
		'toggle.default': Toggle,
		'video.default': Video,
		'image-carousel.default': ImageCarousel,
		'text-editor.default': TextEditor,
	};

	elementorFrontend.on( 'components:init', () => {
		// We first need to delete the property because by default it's a getter function that cannot be overwritten.
		delete elementorFrontend.utils.lightbox;

		elementorFrontend.utils.lightbox = new LightboxModule();
	} );
} );
