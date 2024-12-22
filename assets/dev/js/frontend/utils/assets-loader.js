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
			assetData.loader = this.isAssetLoaded( assetData, type )
				? Promise.resolve( true )
				: this.loadAsset( assetData, type );
		}

		return assetData.loader;
	}

	isAssetLoaded( assetData, assetType ) {
		const filePath = 'script' === assetType ? `script[src="${ assetData.src }"]` : `link[href="${ assetData.src }"]`;

		return !! document.querySelectorAll( filePath )?.length;
	}

	loadAsset( assetData, assetType ) {
		return new Promise( ( resolve ) => {
			const element = 'style' === assetType ? this.getStyleElement( assetData.src ) : this.getScriptElement( assetData.src );

			element.onload = () => resolve( true );

			this.appendAsset( assetData, element );
		} );
	}

	appendAsset( assetData, element ) {
		const beforeElement = document.querySelector( assetData.before );

		if ( !! beforeElement ) {
			beforeElement.insertAdjacentElement( 'beforebegin', element );
			return;
		}

		const parent = 'head' === assetData.parent ? assetData.parent : 'body';

		document[ parent ].appendChild( element );
	}
}

const assetsUrl = elementorFrontendConfig.urls.assets;

const fileSuffix = elementorFrontendConfig.environmentMode.isScriptDebug ? '' : '.min';

const pluginVersion = elementorFrontendConfig.version;

AssetsLoader.assets = {
	script: {
		dialog: {
			src: `${ assetsUrl }lib/dialog/dialog${ fileSuffix }.js?ver=4.9.3`,
		},
		'share-link': {
			src: `${ assetsUrl }lib/share-link/share-link${ fileSuffix }.js?ver=${ pluginVersion }`,
		},
		// TODO: Remove 'swiper' in v3.29.0 [ED-16272].
		swiper: {
			src: `${ assetsUrl }lib/swiper/v8/swiper${ fileSuffix }.js?ver=8.4.5`,
		},
	},
	style: {
		// TODO: Remove 'swiper' in v3.28.0 [ED-16258].
		swiper: {
			src: `${ assetsUrl }lib/swiper/v8/css/swiper${ fileSuffix }.css?ver=8.4.5`,
			parent: 'head',
		},
		'e-lightbox': {
			src: elementorFrontendConfig?.responsive?.hasCustomBreakpoints
				? `${ elementorFrontendConfig.urls.uploadUrl }/elementor/css/custom-lightbox.min.css?ver=${ pluginVersion }`
				: `${ assetsUrl }css/conditionals/lightbox${ fileSuffix }.css?ver=${ pluginVersion }`,
		},
		dialog: {
			src: `${ assetsUrl }css/conditionals/dialog${ fileSuffix }.css?ver=${ pluginVersion }`,
			parent: 'head',
			before: '#elementor-frontend-css',
		},
	},
};
