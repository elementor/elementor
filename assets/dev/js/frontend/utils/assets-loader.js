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
		const assetData = AssetsLoader.assets[ type ][ key ];

		if ( ! assetData.loader ) {
			assetData.loader = new Promise( ( resolve ) => {
				const element = 'style' === type ? this.getStyleElement( assetData.src ) : this.getScriptElement( assetData.src );

				element.onload = () => resolve( true );

				const parent = 'head' === assetData.parent ? assetData.parent : 'body';

				document[ parent ].appendChild( element );
			} );
		}

		return assetData.loader;
	}
}

const fileSuffix = elementorFrontendConfig.environmentMode.isScriptDebug ? '' : '.min';

const swiperSource = elementorFrontendConfig.experimentalFeatures.e_swiper_latest
	? `${ elementorFrontendConfig.urls.assets }lib/swiper/v8/swiper${ fileSuffix }.js?ver=8.4.5`
	: `${ elementorFrontendConfig.urls.assets }lib/swiper/swiper${ fileSuffix }.js?ver=5.3.6`;

AssetsLoader.assets = {
	script: {
		dialog: {
			src: `${ elementorFrontendConfig.urls.assets }lib/dialog/dialog${ fileSuffix }.js?ver=4.9.0`,
		},
		'share-link': {
			src: `${ elementorFrontendConfig.urls.assets }lib/share-link/share-link${ fileSuffix }.js?ver=${ elementorFrontendConfig.version }`,
		},
		swiper: {
			src: swiperSource,
		},
	},
	style: {},
};
