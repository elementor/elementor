export class SetStyles extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'styles', 'object', args );
		this.requireArgumentType( 'bind', 'string', args );

		this.validateStyles( args.styles );
	}

	isStyleVariant( obj ) {
		return obj && 'object' === typeof obj.meta && 'object' === typeof obj.props;
	}

	isStyleDefinition( obj ) {
		return obj &&
			'string' === typeof obj.id &&
			Array.isArray( obj.variants ) && obj.variants.every( this.isStyleVariant ) &&
			( obj.label === undefined || 'string' === typeof obj.label ) &&
			'string' === typeof obj.type;
	}

	validateStyles( styles ) {
		for ( const key in styles ) {
			if ( ! this.isStyleDefinition( styles[ key ] ) ) {
				throw new Error( `Invalid style definition: ${ key }` );
			}
		}
	}

	apply( args = {} ) {
		const { containers = [ args.container ], styles, bind } = args;

		containers.forEach( ( container ) => {
			const styleIds = Object.keys( styles );

			container.model.set( 'styles', styles );

			$e.internal( 'document/elements/set-settings', {
				container,
				options: {
					render: false,
				},
				settings: {
					[ bind ]: {
						$$type: 'classes',
						value: styleIds,
					},
				},
			} );
		} );
	}
}

export default SetStyles;
