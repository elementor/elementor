import Helpers from './utils/helpers';
import Storage from './utils/storage';
import Debug from './utils/debug';
import Ajax from 'elementor-common-modules/ajax/assets/js/ajax';
import Finder from 'elementor-common-modules/finder/assets/js/finder';
import Connect from 'elementor-common-modules/connect/assets/js/connect';
import WordpressComponent from './components/wordpress/component';
import EventsDispatcherComponent from 'elementor-common-modules/event-tracker/assets/js/data/component';
import Events from 'elementor-common-modules/event-tracker/assets/js/events';
import Notifications from 'elementor-utils/notifications';

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
		this.events = new Events();

		this.debug = new Debug();

		this.helpers = new Helpers();

		this.storage = new Storage();

		this.dialogsManager = new DialogsManager.Instance();

		this.notifications = new Notifications();

		this.api = window.$e;

		$e.components.register( new EventsDispatcherComponent() );

		elementorCommon.elements.$window.on( 'elementor:init-components', () => {
			$e.components.register( new WordpressComponent() );
		} );

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

	compileArrayTemplateArgs( template, templateArgs ) {
		return template.replace( /%(?:(\d+)\$)?s/g, ( match, number ) => {
			if ( ! number ) {
				number = 1;
			}

			number--;
			return undefined !== templateArgs[ number ] ? templateArgs[ number ] : match;
		} );
	}

	compileObjectTemplateArgs( template, templateArgs ) {
		return template.replace( /{{(?:([ \w]+))}}/g, ( match, name ) => {
			return templateArgs[ name ] ? templateArgs[ name ] : match;
		} );
	}

	compileTemplate( template, templateArgs ) {
		return jQuery.isPlainObject( templateArgs ) ? this.compileObjectTemplateArgs( template, templateArgs ) : this.compileArrayTemplateArgs( template, templateArgs );
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
			string = this.compileTemplate( string, templateArgs );
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
