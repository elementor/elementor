import Component from './component';
import { AtomicWidgetType } from './atomic-widget-type';

class Module extends elementorModules.editor.utils.Module {
	onInit() {
		$e.components.register( new Component() );

		this.registerAtomicWidgetTypes();

		this.maybeDisplayV4WelcomePopover();
	}

	registerAtomicWidgetTypes() {
		Object.entries( elementor.widgetsCache ?? {} )
			.filter( ( [ , widget ] ) => !! widget.atomic )
			.forEach(
				( [ type ] ) => elementor.elementsManager.registerElementType( new AtomicWidgetType( type ) ),
			);

		this.registerAtomicDivBlockType();
	}

	registerAtomicDivBlockType() {
		const DivBlock = require( './div-block-type' ).default;

		elementor.elementsManager.registerElementType( new DivBlock() );
	}

	maybeDisplayV4WelcomePopover() {
		const urlQueryParams = new URLSearchParams( window.location.search );

		if ( 'true' !== urlQueryParams.get( 'v4_opt_in_welcome' ) ) {
			console.log( 'Not welcome' );
			return;
		}

		console.log( 'Displaying V4 Welcome Popover' );
	}
}

new Module();
