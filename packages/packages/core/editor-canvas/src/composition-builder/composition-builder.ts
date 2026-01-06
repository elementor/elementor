import {
	createElement,
	generateElementId,
	getContainer,
	getWidgetsCache,
	type V1Element,
	type V1ElementConfig,
} from '@elementor/editor-elements';
import { type z } from '@elementor/schema';

import { doUpdateElementProperty } from '../mcp/utils/do-update-element-property';
import { validateInput } from '../mcp/utils/validate-input';

type AnyValue = z.infer< z.ZodTypeAny >;

type API = {
	createElement: typeof createElement;
	getWidgetsCache: typeof getWidgetsCache;
	generateElementId: typeof generateElementId;
	getContainer: typeof getContainer;
	doUpdateElementProperty: typeof doUpdateElementProperty;
};

export class CompositionBuilder {
	private elementConfig: Record< string, Record< string, AnyValue > > = {};
	private elementStylesConfig: Record< string, Record< string, AnyValue > > = {};
	private rootContainers: V1Element[] = [];
	private containerElements: string[] = [];
	private widgetsCache: Record< string, V1ElementConfig > = {};
	private api: API = {
		createElement,
		getWidgetsCache,
		generateElementId,
		getContainer,
		doUpdateElementProperty,
	};

	public static fromXMLString( xmlString: string, api: Partial< API > = {} ): CompositionBuilder {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString( xmlString, 'application/xml' );
		const errorNode = xmlDoc.querySelector( 'parsererror' );
		if ( errorNode ) {
			throw new Error( 'Failed to parse XML string: ' + errorNode.textContent );
		}
		return new CompositionBuilder( xmlDoc, api );
	}

	constructor(
		private xml: Document,
		api: Partial< API > = {}
	) {
		Object.assign( this.api, api );
	}

	setElementConfig( config: Record< string, Record< string, AnyValue > > ) {
		this.elementConfig = config;
	}

	setStylesConfig( config: Record< string, Record< string, AnyValue > > ) {
		this.elementStylesConfig = config;
	}

	public getXML() {
		return this.xml;
	}

	private async iterateBuild( node: Element, containerElement: V1Element, childIndex: number ) {
		const elementTag = node.tagName;
		const isContainer = this.containerElements.includes( elementTag );
		const parentElType = containerElement.model.get( 'elType' );
		let targetContainerId =
			parentElType === 'e-tabs'
				? containerElement.children?.[ 1 ].children?.[ childIndex ]?.id || containerElement.children?.[ 1 ].id
				: containerElement.id;
		if ( ! targetContainerId ) {
			targetContainerId = containerElement.id;
		}
		const newElement = isContainer
			? this.api.createElement( {
					containerId: targetContainerId,
					model: {
						elType: elementTag,
						id: generateElementId(),
					},
					options: { useHistory: false },
			  } )
			: this.api.createElement( {
					containerId: targetContainerId,
					model: {
						elType: 'widget',
						widgetType: elementTag,
						id: generateElementId(),
					},
					options: { useHistory: false },
			  } );
		if ( containerElement.id === 'document' ) {
			this.rootContainers.push( newElement );
		}
		node.setAttribute( 'id', newElement.id );
		let currentChild = 0;
		for await ( const childNode of Array.from( node.children ) ) {
			await this.iterateBuild( childNode, newElement, currentChild );
			currentChild++;
		}
	}

	private findSchemaForNode( node: Element ) {
		const widgetType = node.tagName;
		const widgetData = this.widgetsCache[ widgetType ]?.atomic_props_schema;
		return widgetData || null;
	}

	private matchNodeByConfigId( configId: string ) {
		const node = this.xml.querySelector( `[configuration-id="${ configId }"]` );
		if ( ! node ) {
			throw new Error( `Configuration id "${ configId }" does not have target node.` );
		}
		const id = node.getAttribute( 'id' );
		if ( ! id ) {
			throw new Error( `Node with configuration id "${ configId }" does not have element id.` );
		}
		const element = this.api.getContainer( id );
		if ( ! element ) {
			throw new Error( `Element with id "${ id }" not found but should exist.` );
		}
		return {
			element,
			node,
		};
	}

	applyStyles() {
		const errors: string[] = [];
		const invalidStyles: Record< string, string[] > = {};
		const validStylesPropValues: Record< string, AnyValue > = {};
		for ( const [ styleId, styleConfig ] of Object.entries( this.elementStylesConfig ) ) {
			const { element, node } = this.matchNodeByConfigId( styleId );
			for ( const [ styleName, stylePropValue ] of Object.entries( styleConfig ) ) {
				const { valid, errors: validationErrors } = validateInput.validateStyles( {
					[ styleName ]: stylePropValue,
				} );
				if ( ! valid ) {
					if ( styleConfig.$intention ) {
						invalidStyles[ element.id ] = invalidStyles[ element.id ] || [];
						invalidStyles[ element.id ].push( styleName );
					}
					errors.push( ...( validationErrors || [] ) );
				} else {
					validStylesPropValues[ styleName ] = stylePropValue;
				}
				this.api.doUpdateElementProperty( {
					elementId: element.id,
					propertyName: '_styles',
					propertyValue: validStylesPropValues,
					elementType: node.tagName,
				} );
			}
		}
		return {
			errors,
			invalidStyles,
		};
	}

	applyConfigs() {
		const errors: string[] = [];
		for ( const [ configId, config ] of Object.entries( this.elementConfig ) ) {
			const { element, node } = this.matchNodeByConfigId( configId );
			const propSchema = this.findSchemaForNode( node );
			const result = validateInput.validateProps( propSchema, config );
			if ( ! result.valid && result.errors?.length ) {
				errors.push( ...result.errors );
			} else {
				for ( const [ propertyName, propertyValue ] of Object.entries( config ) ) {
					try {
						this.api.doUpdateElementProperty( {
							elementId: element.id,
							propertyName,
							propertyValue,
							elementType: node.tagName,
						} );
					} catch ( error ) {
						errors.push( ( error as Error ).message );
					}
				}
			}
		}
		return errors;
	}

	async build( rootContainer: V1Element ) {
		// lazy load widgets cache
		if ( Object.entries( this.widgetsCache ).length === 0 ) {
			this.widgetsCache = this.api.getWidgetsCache() || {};
			// still empty? Somethin is wrong. Go Fatal.
			if ( Object.entries( this.widgetsCache ).length === 0 ) {
				throw new Error( 'Widgets cache is empty. Cannot build composition.' );
			}
			const CONTAINER_ELEMENTS = Object.values( this.widgetsCache )
				.filter( ( widget ) => widget.meta?.is_container )
				.map( ( widget ) => widget.elType )
				.filter( ( x ) => typeof x === 'string' );
			this.containerElements = CONTAINER_ELEMENTS;
		}
		// ensure all tags are supported
		new Set( this.xml.querySelectorAll( '*' ) ).forEach( ( node ) => {
			if ( ! this.widgetsCache[ node.tagName ] ) {
				throw new Error( `Unknown widget type: ${ node.tagName }` );
			}
		} );

		const children = Array.from( this.xml.children );
		let currentChild = 0;
		for ( const childNode of children ) {
			await this.iterateBuild( childNode, rootContainer, currentChild );
			currentChild++;
		}

		const { errors: styleErrors, invalidStyles } = this.applyStyles();
		const configErrors = this.applyConfigs();

		return {
			configErrors,
			styleErrors,
			invalidStyles,
			rootContainers: [ ...this.rootContainers ],
		};
	}
}
