export default class AssetsLoader {
	getScriptElement( src ) {
		const scriptElement = document.createElement( 'script' );

		scriptElement.src = src;

		return scriptElement;
	}

	getStyleElement( src ) {
		const styleElement = document.createElement( 'link' );

		styleElement.rel = 'stylesheet';
		styleElement.href = src;

		return styleElement;
	}

	load( type, key ) {
		return new Promise( ( resolve ) => {
			const assetData = this.constructor.assets[ type ][ key ];

			if ( assetData.isLoaded ) {
				resolve( true );

				return;
			}

			this.constructor.assets[ type ][ key ].isLoaded = true;

			const element = 'style' === type ? this.getStyleElement( assetData.src ) : this.getScriptElement( assetData.src );

			element.onload = () => resolve( true );

			const parent = 'head' === assetData.parent ? assetData.parent : 'body';

			document[ parent ].appendChild( element );
		} );
	}
}

const fileSuffix = elementorFrontendConfig.environmentMode.isScriptDebug ? '' : '.min';

AssetsLoader.assets = {
	script: {},
	style: {},
};
