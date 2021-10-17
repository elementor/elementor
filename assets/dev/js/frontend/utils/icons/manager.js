export default class IconsManager {
	static symbolsContainer;

	static iconsUsageList = [];

	constructor( elementsPrefix ) {
		this.prefix = `${ elementsPrefix }-`;

		this.createSvgSymbolsContainer();
	}

	createSvgElement( name, { path, width, height } ) {
		const iconName = this.prefix + name,
			iconSelector = '#' + this.prefix + name;

		// Create symbol if not exist yet.
		if ( ! IconsManager.iconsUsageList.includes( iconName ) ) {
			if ( ! IconsManager.symbolsContainer.querySelector( iconSelector ) ) {
				const symbol = this.createSymbolElement( { id: iconName, path, width, height } );

				IconsManager.symbolsContainer.appendChild( symbol );
			}

			IconsManager.iconsUsageList.push( iconName );
		}

		return this.createSvgIconElement( { iconName, iconSelector } );
	}

	createSvgNode( tag, { props = {}, attrs = {} } ) {
		const node = document.createElementNS( 'http://www.w3.org/2000/svg', tag );

		Object.keys( props ).map( ( key ) => node[ key ] = props[ key ] );
		Object.keys( attrs ).map( ( key ) => node.setAttributeNS( null, key, attrs[ key ] ) );

		return node;
	}

	createSvgIconElement( { iconName, iconSelector } ) {
		return this.createSvgNode( 'svg', {
			props: {
				innerHTML: '<use xlink:href="' + iconSelector + '" />',
			},
			attrs: {
				class: 'e-font-icon-svg e-' + iconName,
			},
		} );
	}

	createSvgSymbolsContainer() {
		if ( ! IconsManager.symbolsContainer ) {
			const symbolsContainerId = 'e-font-icon-svg-symbols';

			IconsManager.symbolsContainer = document.getElementById( symbolsContainerId );

			if ( ! IconsManager.symbolsContainer ) {
				IconsManager.symbolsContainer = this.createSvgNode( 'svg', {
					attrs: {
						style: 'display: none;',
						class: symbolsContainerId,
					},
				} );

				document.body.appendChild( IconsManager.symbolsContainer );
			}
		}
	}

	createSymbolElement( { id, path, width, height } ) {
		return this.createSvgNode( 'symbol', {
			props: {
				innerHTML: '<path d="' + path + '"></path>',
				id,
			},
			attrs: {
				viewBox: '0 0 ' + width + ' ' + height,
			},
		} );
	}
}
