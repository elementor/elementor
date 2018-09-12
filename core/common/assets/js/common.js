import HotKeys from './utils/hot-keys';
import Helpers from './utils/helpers';
import Ajax from '../../modules/ajax/assets/js/ajax';

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
			$document: jQuery( document ),
			$body: jQuery( document.body )
		};
	}

	initEnvData() {
		const userAgent = navigator.userAgent;

		this.envData = {
			webkit: -1 !== userAgent.indexOf( 'AppleWebKit' ),
			firefox: -1 !== userAgent.indexOf( 'Firefox' ),
			ie: /Trident|MSIE/.test( userAgent ),
			mac: -1 !== userAgent.indexOf( 'Macintosh' )
		};
	}

	initComponents() {
		this.helpers = new Helpers();

		this.hotKeys = new HotKeys();

		this.dialogsManager = new DialogsManager.Instance();

		this.ajax = new Ajax();
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
