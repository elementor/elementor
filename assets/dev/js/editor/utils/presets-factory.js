var presetsFactory;

presetsFactory = {

	getPresetsDictionary() {
		return {
			11: 100 / 9,
			12: 100 / 8,
			14: 100 / 7,
			16: 100 / 6,
			33: 100 / 3,
			66: 2 / 3 * 100,
			83: 5 / 6 * 100,
		};
	},

	getAbsolutePresetValues( preset ) {
		var clonedPreset = elementorCommon.helpers.cloneObject( preset ),
			presetDictionary = this.getPresetsDictionary();

		_.each( clonedPreset, function( unitValue, unitIndex ) {
			if ( presetDictionary[ unitValue ] ) {
				clonedPreset[ unitIndex ] = presetDictionary[ unitValue ];
			}
		} );

		return clonedPreset;
	},

	getPresets( columnsCount, presetIndex ) {
		var presets = elementorCommon.helpers.cloneObject( elementor.config.elements.section.presets );

		if ( columnsCount ) {
			presets = presets[ columnsCount ];
		}

		if ( presetIndex ) {
			presets = presets[ presetIndex ];
		}

		return presets;
	},

	getPresetByStructure( structure ) {
		var parsedStructure = this.getParsedStructure( structure );

		return this.getPresets( parsedStructure.columnsCount, parsedStructure.presetIndex );
	},

	// Grid preset looks like 1-2 ( 1 rows, 2 columns )
	getParsedGridStructure( selectedStructure ) {
		selectedStructure += ''; // Make sure this is a string

		const chunks = selectedStructure.split( '-' );

		return {
			rows: chunks[ 0 ],
			columns: chunks[ 1 ],
		};
	},

	getParsedStructure( structure ) {
		structure += ''; // Make sure this is a string

		return {
			columnsCount: structure.slice( 0, -1 ),
			presetIndex: structure.substr( -1 ),
		};
	},

	getPresetSVG( preset, svgWidth, svgHeight, separatorWidth ) {
		svgWidth = svgWidth || 100;
		svgHeight = svgHeight || 50;
		separatorWidth = separatorWidth || 2;

		var absolutePresetValues = this.getAbsolutePresetValues( preset ),
			presetSVGPath = this._generatePresetSVGPath( absolutePresetValues, svgWidth, svgHeight, separatorWidth );

		return this._createSVGPreset( presetSVGPath, svgWidth, svgHeight );
	},

	_createSVGPreset( presetPath, svgWidth, svgHeight ) {
		// This is here to avoid being picked up by https re-write systems
		const protocol = 'ht' + 'tp';
		var svg = document.createElementNS( protocol + '://www.w3.org/2000/svg', 'svg' );

		svg.setAttributeNS( protocol + '://www.w3.org/2000/xmlns/', 'xmlns:xlink', protocol + '://www.w3.org/1999/xlink' );
		svg.setAttribute( 'viewBox', '0 0 ' + svgWidth + ' ' + svgHeight );

		var path = document.createElementNS( protocol + '://www.w3.org/2000/svg', 'path' );

		path.setAttribute( 'd', presetPath );

		svg.appendChild( path );

		return svg;
	},

	_generatePresetSVGPath( preset, svgWidth, svgHeight, separatorWidth ) {
		var DRAW_SIZE = svgWidth - ( separatorWidth * ( preset.length - 1 ) );

		var xPointer = 0,
			dOutput = '';

		for ( var i = 0; i < preset.length; i++ ) {
			if ( i ) {
				dOutput += ' ';
			}

			var increment = preset[ i ] / 100 * DRAW_SIZE;

			xPointer += increment;

			dOutput += 'M' + ( +xPointer.toFixed( 4 ) ) + ',0';

			dOutput += 'V' + svgHeight;

			dOutput += 'H' + ( +( xPointer - increment ).toFixed( 4 ) );

			dOutput += 'V0Z';

			xPointer += separatorWidth;
		}

		return dOutput;
	},

	/**
	 * Return an SVG markup with text of a Container element (e.g. flex, grid, etc.).
	 *
	 * @param {string} presetId - Preset ID to retrieve.
	 * @param {string} text     - The text to show on the preset (Optional - Used only in the default preset).
	 *
	 * @return {string} preset
	 */
	generateContainerPreset( presetId, text = '' ) {
		const presets = {
			'33-33-33': `
				<svg viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="0.5" width="29" height="44" />
					<rect x="30.5" width="29" height="44" />
					<rect x="60.5" width="29" height="44" />
				</svg>
			`,
			'50-50': `
				<svg viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="0.5" width="44" height="44" />
					<rect x="45.5" width="44" height="44" />
				</svg>
			`,
			'c100-c50-50': `
				<svg viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="0.5" width="44" height="44" />
					<rect x="45.5" width="44" height="21.5" />
					<rect x="45.5" y="22.5" width="44" height="21.5" />
				</svg>
			`,
			'50-50-50-50': `
				<svg viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="0.5" width="44" height="21.5" />
					<rect x="45.5" width="44" height="21.5" />
					<rect x="0.5" y="22.5" width="44" height="21.5" />
					<rect x="45.5" y="22.5" width="44" height="21.5" />
				</svg>
			`,
			'33-66': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="29" height="44"/>
					<rect x="30" width="59" height="44"/>
				</svg>
			`,
			'25-25-25-25': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="21.5" height="44"/>
					<rect x="22.5" width="21.5" height="44"/>
					<rect x="45" width="21.5" height="44"/>
					<rect x="67.5" width="21.5" height="44"/>
				</svg>
			`,
			'25-50-25': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="21.5" height="44"/>
					<rect x="22.5" width="44" height="44"/>
					<rect x="67.5" width="21.5" height="44"/>
				</svg>
			`,
			'50-50-100': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="44" height="21.5"/>
					<rect x="45" width="44" height="21.5"/>
					<rect y="22.5" width="89" height="21.5"/>
				</svg>
			`,
			'33-33-33-33-33-33': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="29" height="21.5"/>
					<rect x="30" width="29" height="21.5"/>
					<rect x="60" width="29" height="21.5"/>
					<rect y="22.5" width="29" height="21.5"/>
					<rect x="30" y="22.5" width="29" height="21.5"/>
					<rect x="60" y="22.5" width="29" height="21.5"/>
				</svg>
			`,
			'33-33-33-33-66': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="29" height="21.5"/>
					<rect x="30" width="29" height="21.5"/>
					<rect x="60" width="29" height="21.5"/>
					<rect y="22.5" width="29" height="21.5"/>
					<rect x="30" y="22.5" width="59" height="21.5"/>
				</svg>
			`,
			'66-33-33-66': `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="59" height="21.5"/>
					<rect x="60" width="29" height="21.5"/>
					<rect y="22.5" width="29" height="21.5"/>
					<rect x="30" y="22.5" width="59" height="21.5"/>
				</svg>
			`,
			c100: `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<title>${ __( 'Direction Column', 'elementor' ) }</title>
					<rect width="89" height="44" />
					<path d="M43.956 24.644L42 22.748C41.848 22.596 41.672 22.52 41.472 22.52C41.28 22.52 41.108 22.596 40.956 22.748C40.804 22.9 40.728 23.076 40.728 23.276C40.728 23.476 40.804 23.652 40.956 23.804L44.304 27.056C44.456 27.208 44.628 27.284 44.82 27.284C45.02 27.284 45.196 27.208 45.348 27.056L48.504 23.852C48.656 23.7 48.732 23.524 48.732 23.324C48.732 23.124 48.656 22.948 48.504 22.796C48.352 22.644 48.176 22.568 47.976 22.568C47.776 22.568 47.6 22.644 47.448 22.796L45.456 24.848L45.504 17.048C45.504 16.848 45.428 16.676 45.276 16.532C45.124 16.38 44.948 16.304 44.748 16.304C44.548 16.304 44.372 16.38 44.22 16.532C44.076 16.676 44.004 16.848 44.004 17.048L43.956 24.644Z"/>
				</svg>
			`,
			r100: `
				<svg viewBox="0 0 89 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<title>${ __( 'Direction Row', 'elementor' ) }</title>
					<rect width="89" height="44"/>
					<path d="M47.856 23.352L45.948 25.296C45.796 25.448 45.72 25.624 45.72 25.824C45.72 26.024 45.796 26.2 45.948 26.352C46.1 26.504 46.276 26.58 46.476 26.58C46.676 26.58 46.852 26.504 47.004 26.352L50.256 23.004C50.408 22.852 50.484 22.676 50.484 22.476C50.484 22.276 50.408 22.1 50.256 21.948L47.052 18.804C46.9 18.652 46.724 18.576 46.524 18.576C46.324 18.576 46.148 18.652 45.996 18.804C45.844 18.956 45.768 19.132 45.768 19.332C45.768 19.524 45.844 19.696 45.996 19.848L48.048 21.852L40.248 21.804C40.048 21.804 39.872 21.88 39.72 22.032C39.576 22.176 39.504 22.348 39.504 22.548C39.504 22.748 39.576 22.924 39.72 23.076C39.872 23.228 40.048 23.304 40.248 23.304L47.856 23.352Z"/>
				</svg>
			`,
			default: `
				<div style="--text:'${ text }'" class="e-preset--container">
					<svg viewBox="0 0 90 44" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="89" height="44" transform="translate(0.5)" />
						<rect x="3" y="2.5" width="84" height="39" rx="2.5" stroke="#FCFCFC" stroke-linejoin="round" stroke-dasharray="3 2"/>
					</svg>
				</div>
			`,
		};

		return presets[ presetId ] || presets.default;
	},

	getContainerPresets() {
		return [
			'c100',
			'r100',
			'50-50',
			'33-66',
			'25-25-25-25',
			'25-50-25',
			'50-50-50-50',
			'50-50-100',
			'c100-c50-50',
			'33-33-33-33-33-33',
			'33-33-33-33-66',
			'66-33-33-66',
		];
	},

	generateContainerGridPreset( preset ) {
		const presets = {
			'1-2': `
				<svg width="92" height="46" viewBox="0 0 92 46" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g opacity="0.8">
						<rect x="0.941406" y="1" width="90" height="44.5" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M45.9414 1.12402V45.3768" stroke="#515962" stroke-dasharray="3 3"/>
					</g>
				</svg>
			`,
			'2-1': `
				<svg width="92" height="47" viewBox="0 0 92 47" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="91.2227" y="1.35059" width="44.5" height="90" transform="rotate(90 91.2227 1.35059)" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
					<path d="M91.0957 23.6006L1.34961 23.6006" stroke="#515962" stroke-dasharray="3 3"/>
				</svg>
			`,
			'1-3': `
				<svg width="92" height="46" viewBox="0 0 92 46" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g opacity="0.8">
						<rect x="0.941895" y="0.944336" width="90" height="44.5" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M30.9419 1.19824V45.4443" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M60.9419 1.19824V45.4443" stroke="#515962" stroke-dasharray="3 3"/>
					</g>
				</svg>
			`,
			'3-1': `
				<svg width="92" height="46" viewBox="0 0 92 46" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g opacity="0.8">
						<rect x="90.9419" y="0.944336" width="44.5" height="90" transform="rotate(90 90.9419 0.944336)" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M90.6155 15.5654L1.26713 15.5654" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M90.6155 30.1875L1.26713 30.1875" stroke="#515962" stroke-dasharray="3 3"/>
					</g>
				</svg>
			`,
			'2-2': `
				<svg width="92" height="46" viewBox="0 0 92 46" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g opacity="0.8">
						<rect x="0.941895" y="0.944336" width="90" height="44.5" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M45.9419 1.19727V45.4443" stroke="#515962" stroke-dasharray="3 3"/>
						<path d="M90.9419 23.3213L0.941896 23.3213" stroke="#515962" stroke-dasharray="3 3"/>
					</g>
				</svg>
			`,
			'2-3': `
				<svg width="92" height="46" viewBox="0 0 92 46" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect opacity="0.8" x="90.9419" y="0.944336" width="44.5" height="90" transform="rotate(90 90.9419 0.944336)" fill="white" stroke="#515962" stroke-dasharray="3 3"/>
					<path d="M0.941895 22.3711L90.9419 22.3711" stroke="#515962" stroke-dasharray="3 3"/>
					<path d="M60.9419 45.4443L60.9419 1.56836" stroke="#515962" stroke-dasharray="3 3"/>
					<path d="M30.9419 45.4443L30.9419 1.56836" stroke="#515962" stroke-dasharray="3 3"/>
				</svg>
			`,
		};

		return presets[ preset ];
	},

	getContainerGridPresets() {
		return [
			'1-2',
			'2-1',
			'1-3',
			'3-1',
			'2-2',
			'2-3',
		];
	},
};

module.exports = presetsFactory;
