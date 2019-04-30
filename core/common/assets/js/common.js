import Helpers from './utils/helpers';
import Storage from './utils/storage';
import Ajax from '../../modules/ajax/assets/js/ajax';
import Finder from '../../modules/finder/assets/js/finder';
import Connect from '../../modules/connect/assets/js/connect';
import Components from './utils/components';
import Commands from './utils/commands';
import Route from './utils/route';
import Shortcuts from './utils/shortcuts';

class ElementorCommonApp extends elementorModules.ViewModule {
	setMarionetteTemplateCompiler() {
		Marionette.TemplateCache.prototype.compileTemplate = ( rawTemplate, options ) => {
			options = {
				evaluate: /<#([\s\S]+?)#>/g,
				interpolate: /{{{([\s\S]+?)}}}/g,
				escape: /{{([^}]+?)}}(?!})/g,
			};

			return _.template( rawTemplate, options );
		};
	}

	getDefaultElements() {
		return {
			$window: jQuery( window ),
			$document: jQuery( document ),
			$body: jQuery( document.body ),
		};
	}

	initComponents() {
		this.helpers = new Helpers();

		this.storage = new Storage();

		this.components = new Components();

		this.shortcuts = new Shortcuts( this.elements.$window );

		this.commands = new Commands();

		this.route = new Route();

		this.dialogsManager = new DialogsManager.Instance();

		this.initModules();
	}

	initModules() {
		const { activeModules } = this.config;

		const modules = {
			ajax: Ajax,
			finder: Finder,
			connect: Connect,
		};

		activeModules.forEach( ( name ) => {
			if ( modules[ name ] ) {
				this[ name ] = new modules[ name ]( this.config[ name ] );
			}
		} );
	}

	translate( stringKey, context, templateArgs, i18nStack ) {
		if ( context ) {
			i18nStack = this.config[ context ].i18n;
		}

		if ( ! i18nStack ) {
			i18nStack = this.config.i18n;
		}

		let string = i18nStack[ stringKey ];

		if ( undefined === string ) {
			string = stringKey;
		}

		if ( templateArgs ) {
			string = string.replace( /%(?:(\d+)\$)?s/g, function( match, number ) {
				if ( ! number ) {
					number = 1;
				}

				number--;

				return undefined !== templateArgs[ number ] ? templateArgs[ number ] : match;
			} );
		}

		return string;
	}

	onInit() {
		super.onInit();

		this.config = elementorCommonConfig;

		this.setMarionetteTemplateCompiler();
	}
}

window.elementorCommon = new ElementorCommonApp();

elementorCommon.initComponents();
