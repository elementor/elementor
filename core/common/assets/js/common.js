import Helpers from './utils/helpers';
import Storage from './utils/storage';
import Ajax from '../../modules/ajax/assets/js/ajax';
import Finder from '../../modules/finder/assets/js/finder';
import Connect from '../../modules/connect/assets/js/connect';
import Components from './components/components';
import Hooks from './components/hooks';
import Events from './components/events';
import Commands from './components/commands';
import Routes from './components/routes';
import Shortcuts from './components/shortcuts';
import BackwardsCompatibility from './components/backwards-compatibility';

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

		window.$e = {
			components: new Components(),
			hooks: new Hooks(),
			events: new Events(),
			commands: new Commands(),
			routes: new Routes(),
			shortcuts: new Shortcuts( jQuery( window ) ),
			bc: new BackwardsCompatibility(),

			run: ( ...args ) => {
				return $e.commands.run.apply( $e.commands, args );
			},

			route: ( ...args ) => {
				return $e.routes.to.apply( $e.routes, args );
			},
		};

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
