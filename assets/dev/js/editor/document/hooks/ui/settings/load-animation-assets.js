import After from 'elementor-api/modules/hooks/ui/after';

const ANIMATION_CONTROL_TYPES = {
	animation: '',
	exit_animation: '',
	hover_animation: 'e-animation-',
};

export class LoadAnimationAssets extends After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'load-animation-assets--document/elements/settings';
	}

	getConditions( args ) {
		const { containers = [ args.container ], settings = {} } = args;
		const settingKeys = Object.keys( settings );

		return containers.some( ( container ) =>
			settingKeys.some( ( key ) => {
				const control = container.controls?.[ key ];
				return control && Object.keys( ANIMATION_CONTROL_TYPES ).includes( control.type );
			} )
		);
	}

	apply( args ) {
		const { containers = [ args.container ], settings = {} } = args;

		const previewWindow = elementor.$preview?.[ 0 ]?.contentWindow;

		if ( ! previewWindow?.elementorFrontend ) {
			return;
		}

		const { urls, environmentMode } = previewWindow.elementorFrontend.config;
		const fileSuffix = environmentMode.isScriptDebug ? '' : '.min';

		containers.forEach( ( container ) => {
			Object.entries( settings ).forEach( ( [ key, value ] ) => {
				if ( ! value || 'none' === value ) {
					return;
				}

				const control = container.controls?.[ key ];

				if ( ! control || ! Object.keys( ANIMATION_CONTROL_TYPES ).includes( control.type ) ) {
					return;
				}

				const filePrefix = ANIMATION_CONTROL_TYPES[ control.type ];
				const url = `${ urls.assets }lib/animations/styles/${ filePrefix }${ value }${ fileSuffix }.css`;

				elementor.helpers.enqueuePreviewStylesheet( url, { id: `e-animation-${ value }-css` } );
			} );
		} );
	}
}

export default LoadAnimationAssets;
