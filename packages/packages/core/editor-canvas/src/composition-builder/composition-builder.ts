import {
	createElement,
	type CreateElementParams,
	deleteElement,
	generateElementId,
	getContainer,
	getWidgetsCache,
	type V1Element,
	type V1ElementConfig,
	type V1ElementModelProps,
} from '@elementor/editor-elements';
import { type z } from '@elementor/schema';

import { doUpdateElementProperty } from '../mcp/utils/do-update-element-property';
import { mergeCustomCssText } from '../mcp/utils/merge-custom-css';
import { RequiredChildrenEnforcer } from './utils/required-children-enforcer';
import { getRequiredDefaultChildTemplates } from './utils/required-default-child-tags';
import { collectFormAncestorErrors, collectSubmitButtonErrors, collectEmptyMessageErrors } from '../form-structure/utils';

type AnyValue = z.infer< z.ZodTypeAny >;
type AnyConfig = Record< string, Record< string, AnyValue > >;

const CREATE_ELEMENT_INVALID_CONTAINER_MESSAGE = 'createElement did not return an element container with a model.';

type API = {
	createElement: typeof createElement;
	deleteElement: typeof deleteElement;
	getWidgetsCache: typeof getWidgetsCache;
	generateElementId: typeof generateElementId;
	getContainer: typeof getContainer;
	doUpdateElementProperty: typeof doUpdateElementProperty;
};

type CtorOptions = {
	xml: Document;
	api?: Partial< API >;
	elementConfig?: AnyConfig;
	stylesConfig?: AnyConfig;
	customCSS?: Record< string, string >;
};

export class CompositionBuilder {
	private elementConfig: Record< string, Record< string, AnyValue > > = {};
	private elementStylesConfig: Record< string, Record< string, AnyValue > > = {};
	private elementCustomCSS: Record< string, string > = {};
	private rootContainers: V1Element[] = [];
	private api: API = {
		createElement,
		deleteElement,
		getWidgetsCache,
		generateElementId,
		getContainer,
		doUpdateElementProperty,
	};
	private xml: Document;

	public static fromXMLString( xmlString: string, api: Partial< API > = {} ): CompositionBuilder {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString( xmlString, 'application/xml' );
		const errorNode = xmlDoc.querySelector( 'parsererror' );
		if ( errorNode ) {
			throw new Error( 'Failed to parse XML string: ' + errorNode.textContent );
		}
		return new CompositionBuilder( {
			xml: xmlDoc,
			api,
		} );
	}

	constructor( opts: CtorOptions ) {
		const { api = {}, elementConfig = {}, stylesConfig = {}, customCSS = {}, xml } = opts;
		this.xml = xml;
		Object.assign( this.api, api );
		this.setElementConfig( elementConfig );
		this.setStylesConfig( stylesConfig );
		this.setCustomCSS( customCSS );
	}

	setElementConfig( config: Record< string, Record< string, AnyValue > > ) {
		this.elementConfig = config;
	}

	setStylesConfig( config: Record< string, Record< string, AnyValue > > ) {
		this.elementStylesConfig = config;
	}

	setCustomCSS( config: Record< string, string > ) {
		this.elementCustomCSS = config;
	}

	getXML() {
		return this.xml;
	}

	private buildModelTree(
		node: Element,
		widgetsCache: Record< string, V1ElementConfig >
	): Record< string, unknown > {
		const elementTag = node.tagName;
		const isWidget = widgetsCache[ elementTag ]?.elType === 'widget';
		const id = this.api.generateElementId();
		const children = Array.from( node.children ).map( ( child ) => this.buildModelTree( child, widgetsCache ) );

		node.setAttribute( 'id', id );

		const base: V1ElementModelProps = {
			id,
			skipDefaultChildren: true,
			elements: children as V1ElementModelProps[ 'elements' ],
			editor_settings: {
				title: node.getAttribute( 'configuration-id' ) ?? undefined,
			},
			elType: 'widget',
		};

		// TODO: Restore this code once components are working in compositions
		// if ( elementTag === 'e-component' ) {
		// 	// apply component id before applying values
		// 	const elementConfig = this.elementConfig[ String( node.getAttribute( 'configuration-id' ) ) ];
		// 	if ( elementConfig ) {
		// 		base.settings = base.settings || {};
		// 		base.settings.component_instance = elementConfig.component_instance;
		// 	}
		// }

		if ( isWidget ) {
			return { ...base, elType: 'widget' as const, widgetType: elementTag };
		}

		return { ...base, elType: elementTag };
	}

	private async awaitViewRender( element: V1Element ) {
		const view = element.view as Record< string, unknown > | undefined;
		if ( view?._currentRenderPromise instanceof Promise ) {
			await view._currentRenderPromise;
		} else {
			await Promise.resolve();
		}
	}

	private validateChildTypes( node: Element, widgetsCache: Record< string, V1ElementConfig > ): string[] {
		const errors: string[] = [];
		const allowedChildTypes = widgetsCache[ node.tagName ]?.allowed_child_types;

		if ( allowedChildTypes?.length ) {
			for ( const child of Array.from( node.children ) ) {
				if ( ! allowedChildTypes.includes( child.tagName ) ) {
					errors.push(
						`"${ child.tagName }" is not allowed as a child of "${
							node.tagName
						}". Allowed: ${ allowedChildTypes.join( ', ' ) }`
					);
				}
			}
		}

		for ( const child of Array.from( node.children ) ) {
			errors.push( ...this.validateChildTypes( child, widgetsCache ) );
		}

		return errors;
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

	private async applyProperties() {
		const configErrors: string[] = [];
		const styleErrors: string[] = [];

		const allConfigIds = new Set( [
			...Object.keys( this.elementConfig ),
			...Object.keys( this.elementStylesConfig ),
			...Object.keys( this.elementCustomCSS ),
		] );

		for ( const configId of allConfigIds ) {
			let element, node;
			try {
				( { element, node } = this.matchNodeByConfigId( configId ) );
			} catch ( matchErr ) {
				const msg = ( matchErr as Error ).message;
				if ( this.elementConfig[ configId ] ) {
					configErrors.push( msg );
				}
				if ( this.elementStylesConfig[ configId ] || this.elementCustomCSS[ configId ] ) {
					styleErrors.push( msg );
				}
				continue;
			}

			const config = this.elementConfig[ configId ];
			if ( config ) {
				for ( const [ propertyName, propertyValue ] of Object.entries( config ) ) {
					try {
						this.api.doUpdateElementProperty( {
							elementId: element.id,
							propertyName,
							propertyValue,
							elementType: node.tagName,
						} );
					} catch ( error ) {
						configErrors.push( ( error as Error ).message );
					}
				}
			}

			const styleConfig = this.elementStylesConfig[ configId ];
			const hasInvalidStyles = false;
			if ( styleConfig ) {
				const validStylesPropValues: Record< string, AnyValue > = {};
				for ( const [ styleName, stylePropValue ] of Object.entries( styleConfig ) ) {
					if ( styleName === '$intention' ) {
						continue;
					} else {
						// skipping actual validation - properies comes from the server
						validStylesPropValues[ styleName ] = stylePropValue;
					}
				}
				if ( Object.keys( validStylesPropValues ).length > 0 ) {
					try {
						this.api.doUpdateElementProperty( {
							elementId: element.id,
							propertyName: '_styles',
							propertyValue: validStylesPropValues,
							elementType: node.tagName,
						} );
					} catch ( error ) {
						styleErrors.push( String( error ) );
					}
				}
			}

			const intentionCss = typeof styleConfig?.$intention === 'string' ? styleConfig.$intention.trim() : '';
			const fallbackCss = hasInvalidStyles && intentionCss ? intentionCss : '';
			const mergedCustomCss = mergeCustomCssText( this.elementCustomCSS[ configId ], fallbackCss );
			if ( mergedCustomCss ) {
				try {
					this.api.doUpdateElementProperty( {
						elementId: element.id,
						propertyName: '_styles',
						propertyValue: { custom_css: mergedCustomCss },
						elementType: node.tagName,
					} );
				} catch ( cssErr ) {
					styleErrors.push( String( cssErr ) );
				}
			}

			await this.awaitViewRender( element );
		}

		return { configErrors, styleErrors };
	}

	async build( rootContainer: V1Element ) {
		const widgetsCache = this.api.getWidgetsCache() || {};

		new Set( this.xml.querySelectorAll( '*' ) ).forEach( ( node ) => {
			if ( ! widgetsCache[ node.tagName ] ) {
				throw new Error( `Unknown widget type: ${ node.tagName }` );
			}
		} );

		const typesWithRequiredChildren = Object.keys( widgetsCache ).filter(
			( elementType ) => getRequiredDefaultChildTemplates( widgetsCache[ elementType ] ).length > 0
		);

		typesWithRequiredChildren.forEach( ( elementType ) => {
			new RequiredChildrenEnforcer( elementType, widgetsCache ).enforce( this.xml );
		} );

		const childTypeErrors: string[] = [];
		for ( const rootChild of Array.from( this.xml.children ) ) {
			childTypeErrors.push( ...this.validateChildTypes( rootChild, widgetsCache ) );
		}
		if ( childTypeErrors.length ) {
			throw new Error( `Invalid element structure:\n${ childTypeErrors.join( '\n' ) }` );
		}

		const formErrors = [
			...collectFormAncestorErrors( this.xml ),
			...collectSubmitButtonErrors( this.xml ),
			...collectEmptyMessageErrors( this.xml ),
		];

		const children = Array.from( this.xml.children );
		for ( const childNode of children ) {
			const modelTree = this.buildModelTree( childNode, widgetsCache );

			try {
				const newElement = this.api.createElement( {
					container: rootContainer,
					model: modelTree as CreateElementParams[ 'model' ],
					options: { useHistory: false },
				} );
				if ( ! newElement?.model ) {
					throw new Error( CREATE_ELEMENT_INVALID_CONTAINER_MESSAGE );
				}
				this.rootContainers.push( newElement );
				await this.awaitViewRender( newElement );
			} catch ( e: unknown ) {
				const attempToRestoreInvalidContainer = this.api.getContainer( modelTree.id as string );
				if ( attempToRestoreInvalidContainer ) {
					this.api.deleteElement( { container: attempToRestoreInvalidContainer } );
				}
				throw e;
			}
		}

		const { configErrors, styleErrors } = await this.applyProperties();

		if ( typeof window !== 'undefined' ) {
			const targetWindow = window.top || window;
			targetWindow.dispatchEvent(
				new CustomEvent( 'elementor/composition/built', {
					detail: { rootContainers: this.rootContainers.map( ( c ) => c.id ) },
				} )
			);
		}

		return {
			configErrors,
			styleErrors,
			formErrors,
			rootContainers: [ ...this.rootContainers ],
		};
	}
}
