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
	script: {
		dialog: {
			src: `${ elementorFrontendConfig.urls.assets }lib/dialog/dialog${ fileSuffix }.js?ver=4.8.1`,
		},
		'share-link': {
			src: `${ elementorFrontendConfig.urls.assets }lib/share-link/share-link${ fileSuffix }.js?ver=${ elementorFrontendConfig.version }`,
		},
		swiper: {
			src: `${ elementorFrontendConfig.urls.assets }lib/swiper/swiper${ fileSuffix }.js?ver=5.3.6`,
		},
	},
	style: {},
};
