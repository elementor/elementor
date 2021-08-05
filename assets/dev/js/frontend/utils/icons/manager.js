export default class IconsManager {
	static symbolsContainer;

	static iconsUsageList = [];

	constructor( elementsPrefix ) {
		this.prefix = `${ elementsPrefix }-`;

		if ( ! IconsManager.symbolsContainer ) {
			const symbolsContainerId = 'e-font-icon-svg-symbols';

			IconsManager.symbolsContainer = document.getElementById( symbolsContainerId );

			if ( ! IconsManager.symbolsContainer ) {
				IconsManager.symbolsContainer = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );

				IconsManager.symbolsContainer.setAttributeNS( null, 'style', 'display: none;' );
				IconsManager.symbolsContainer.setAttributeNS( null, 'class', symbolsContainerId );

				document.body.appendChild( IconsManager.symbolsContainer );
			}
		}
	}

	createSvgElement( name, { path, width, height } ) {
		const elementName = this.prefix + name,
			elementSelector = '#' + this.prefix + name;

		// Create symbol if not exist yet.
		if ( ! IconsManager.iconsUsageList.includes( elementName ) ) {
			if ( ! IconsManager.symbolsContainer.querySelector( elementSelector ) ) {
				const symbol = document.createElementNS( 'http://www.w3.org/2000/svg', 'symbol' );

				symbol.id = elementName;
				symbol.innerHTML = '<path d="' + path + '"></path>';

				symbol.setAttributeNS( null, 'viewBox', '0 0 ' + width + ' ' + height );

				IconsManager.symbolsContainer.appendChild( symbol );
			}

			IconsManager.iconsUsageList.push( elementName );
		}

		const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );

		svg.innerHTML = '<use xlink:href="' + elementSelector + '" />';

		svg.setAttributeNS( null, 'class', 'e-font-icon-svg e-' + elementName );

		return svg;
	}
}
