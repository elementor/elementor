module.exports = class ConfigProvider {
	/**
	 * @type {Object}
	 */
	#elementsConfig;

	/**
	 * @type {Object}
	 */
	#testConfig;

	/**
	 * @param {Object} args
	 * @param {Object} args.elementsConfig
	 * @param {Object} args.testConfig
	 */
	constructor( { elementsConfig, testConfig } ) {
		this.#elementsConfig = elementsConfig;
		this.#testConfig = this.#createTestConfig( testConfig );
	}

	/**
	 * @param {Object} args
	 * @param {Object} args.elementsConfig
	 * @param {Object} args.testConfig
	 */
	static make( { elementsConfig, testConfig } ) {
		return new this( { elementsConfig, testConfig } );
	}

	/**
	 * Get all the widgets that should be tested.
	 *
	 * @return {{widgetType: string, widgetConfig: Object}[]}
	 */
	getWidgetsTypes() {
		return Object.entries( this.#elementsConfig ).filter(
			( [ widgetType ] ) =>
				this.#isIncluded( this.#testConfig.elements, widgetType ) &&
				! this.#isExcluded( this.#testConfig.elements, widgetType ),
		).map( ( [ widgetType, widgetConfig ] ) => {
			return { widgetType, widgetConfig };
		} );
	}

	/**
	 * Get all the controls for specific widget type that should be tested.
	 *
	 * @param {string} widgetType
	 * @return {{controlConfig: Object, sectionConfig: Object, controlId: string, widgetType: string}[]}
	 */
	getControlsForTests( widgetType ) {
		const currentConfig = this.#merge(
			this.#testConfig.controls[ '*' ],
			this.#testConfig.controls[ widgetType ],
		);

		return Object.entries( this.#elementsConfig[ widgetType ].controls || {} )
			.filter( ( [ controlId ] ) => {
				return this.#isIncluded( currentConfig, controlId ) &&
					! this.#isExcluded( currentConfig, controlId );
			} )
			.map( ( [ controlId, controlConfig ] ) => {
				return {
					widgetType,
					controlId,
					controlConfig,
					sectionConfig: this.#elementsConfig[ widgetType ].controls[ controlConfig.section ],
				};
			} );
	}

	/**
	 * Get all the dependencies for specific widget type and control id
	 *
	 * @param {string}  widgetType
	 * @param {string } controlId
	 * @return {{controlConfig: Object, sectionConfig: Object, controlId: string, value: *, widgetType: string}[]}
	 */
	getControlDependencies( widgetType, controlId ) {
		const currentConfig = this.#merge(
			this.#testConfig.controls[ '*' ],
			this.#testConfig.controls[ widgetType ],
		);

		const deps = {
			...( currentConfig.dependencies?.[ '*' ] || {} ),
			...( currentConfig.dependencies?.[ controlId ] || {} ),
		};

		return Object.entries( deps )
			.map( ( [ depControlId, value ] ) => {
				const controlConfig = this.#elementsConfig[ widgetType ].controls[ depControlId ];
				const sectionConfig = this.#elementsConfig[ widgetType ].controls[ controlConfig.section ];

				return {
					widgetType,
					controlId: depControlId,
					controlConfig,
					sectionConfig,
					value,
				};
			} );
	}

	/**
	 * @param {Object} config
	 * @param {string} type
	 * @return {boolean}
	 */
	#isIncluded( config, type ) {
		if ( ! config.hasOwnProperty( 'include' ) ) {
			return true;
		}

		return config.include.some( ( term ) => this.#compare( term, type ) );
	}

	/**
	 * @param {Object} config
	 * @param {string} type
	 * @return {boolean}
	 */
	#isExcluded( config, type ) {
		if ( ! config.hasOwnProperty( 'exclude' ) ) {
			return false;
		}

		return config.exclude.some( ( term ) => this.#compare( term, type ) );
	}

	/**
	 * @param {Object|undefined} source
	 * @param {Object|undefined} target
	 * @return {Object}
	 */
	#merge( source, target ) {
		const result = {};

		[ 'include', 'exclude', 'dependencies' ].forEach( ( key ) => {
			[ source, target ].forEach( ( config ) => {
				if ( ! config || ! config.hasOwnProperty( key ) ) {
					return;
				}

				result[ key ] = Array.isArray( config[ key ] )
					? [ ...( result?.[ key ] || [] ), ...config[ key ] ]
					: { ...( result?.[ key ] || {} ), ...config[ key ] };
			} );
		} );

		return result;
	}

	/**
	 * @param {RegExp|string} term
	 * @param {string}        type
	 * @return {boolean}
	 */
	#compare( term, type ) {
		if ( term instanceof RegExp ) {
			return term.test( type );
		}

		return term === type;
	}

	/**
	 * @param {Object} config
	 * @return {Object}
	 */
	#createTestConfig( config ) {
		return {
			elements: {
				...( config.elements || {} ),
			},
			controls: {
				'*': {},
				...( config.controls || {} ),
			},
		};
	}
};
