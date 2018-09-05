import Assistant from 'elementor/core/common/modules/assistant/assets/js/assistant';
import HotKeys from './utils/hot-keys';
import Helpers from './utils/helpers';

const ViewModule = require( 'elementor-utils/view-module' );

class ElementorCommonApp extends ViewModule {
	setMarionetteTemplateCompiler() {
		Marionette.TemplateCache.prototype.compileTemplate = ( rawTemplate, options ) => {
			options = {
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /{{{([\s\S]+?)}}}/g,
				escape: /{{([^}]+?)}}(?!})/g
			};

			return _.template( rawTemplate, options );
		};
	}

	getDefaultElements() {
		return {
			$window: jQuery( window ),
			$body: jQuery( 'body' )
		};
	}

	initEnvData() {
		this.envData = {
			webkit: -1 !== navigator.userAgent.indexOf( 'AppleWebKit' ),
			firefox: -1 !== navigator.userAgent.indexOf( 'Firefox' ),
			mac: -1 !== navigator.userAgent.indexOf( 'Macintosh' )
		};
	}

	initComponents() {
		this.helpers = new Helpers();

		this.hotKeys = new HotKeys();

		this.dialogsManager = new DialogsManager.Instance();

		this.assistant = new Assistant( this.config.assistant );
	}

	onInit() {
		super.onInit();

		this.config = elementorCommonConfig;

		this.initEnvData();

		this.setMarionetteTemplateCompiler();
	}
}

window.elementorCommon = new ElementorCommonApp();

elementorCommon.initComponents();
