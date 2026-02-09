import { type V1Element } from '@elementor/editor-elements';
import { type Props, type PropValue } from '@elementor/editor-props';

export type RenderContext< T = unknown > = Record< string, T >;

export type NamespacedRenderContext< T = RenderContext > = Record< string, T | undefined >;

export type LegacyWindow = Window & {
	jQuery: JQueryStatic;
	elementor: {
		config: {
			user: {
				is_administrator?: boolean;
			};
		};
		createBackboneElementsCollection: ( children: unknown ) => BackboneCollection< ElementModel >;
		getElementData: ( model: unknown ) => { title: string };

		modules: {
			elements: {
				types: {
					Widget: typeof ElementType;
					Base: typeof ElementType;
				};
				views: {
					Widget: typeof ElementView;
					createAtomicElementBase: (
						type: string
					) => typeof ElementView & MarionetteExtendable< ElementView >;
				};
				models: {
					AtomicElementBase: BackboneModelConstructor< ElementModel >;
				};
			};
		};
		elementsManager: {
			registerElementType: ( type: ElementType ) => void;
			getElementTypeClass: ( type: string ) => typeof ElementType | undefined;
			_elementTypes: Record< string, ElementType >;
		};
		$preview: JQueryElement &
			[
				{
					contentWindow: {
						dispatchEvent: ( event: Event ) => void;
					};
				},
			];
		$previewWrapper: JQueryElement;
	};
};

type JQueryStatic = ( html: string ) => JQueryElement;

export declare class ElementType {
	getType(): string;

	getView(): typeof ElementView;
}

type MarionetteExtendable< TBase = unknown > = {
	extend: < TExtended extends object >(
		properties: TExtended & ThisType< TBase & TExtended >
	) => TBase & TExtended & MarionetteExtendable< TBase & TExtended >;
};

export declare class ElementView {
	getChildType(): string[];

	container: V1Element;

	$el: JQueryElement;
	el: HTMLElement;

	model: BackboneModel< ElementModel >;

	_abortController: AbortController | null;

	collection: BackboneCollection< ElementModel >;

	children: {
		length: number;
		findByIndex: ( index: number ) => ElementView;
		each: ( callback: ( view: ElementView ) => void ) => void;
	};

	constructor( ...args: unknown[] );

	onRender( ...args: unknown[] ): void;

	onDestroy( ...args: unknown[] ): void;

	attributes(): Record< string, unknown >;

	behaviors(): Record< string, unknown >;

	getDomElement(): JQueryElement;

	getHandlesOverlay(): JQueryElement | null;

	setElement( element: JQueryElement ): void;

	dispatchPreviewEvent( eventType: string ): void;

	getContextMenuGroups(): ContextMenuGroup[];

	/**
	 * Templated view methods:
	 */
	getTemplateType(): string;

	renderOnChange(): void;

	render(): void;

	_renderTemplate(): void;

	_renderChildren(): void;

	_beforeRender(): void;

	_afterRender(): void;

	attachBuffer( collectionView: this, buffer: DocumentFragment ): void;

	triggerMethod( method: string, ...args: unknown[] ): void;

	bindUIElements(): void;

	_ensureViewIsIntact(): void;

	_isRendering: boolean;

	resetChildViewContainer(): void;

	childViewContainer: string;

	isRendered: boolean;

	_currentRenderPromise?: Promise< void >;

	#childrenRenderPromises?: Promise< void >[];

	options?: {
		model: BackboneModel< ElementModel >;
	};

	ui(): Record< string, unknown >;

	events(): Record< string, unknown >;

	_parent?: ElementView;

	getRenderContext(): NamespacedRenderContext | undefined;

	getResolverRenderContext(): RenderContext | undefined;

	getNamespaceKey(): string;

	invalidateRenderCache(): void;

	_openEditingPanel( options?: { scrollIntoView: boolean } ): void;

	once: ( event: string, callback: () => void ) => void;
}

type JQueryElement = {
	find: ( selector: string ) => JQueryElement;
	html: ( html: string ) => void;
	get: ( index: number ) => HTMLElement | undefined;
	attr: {
		( name: string ): string;
		( name: string, value: string ): JQueryElement;
	};
	prepend: ( element: JQueryElement ) => JQueryElement;
	on: ( event: string, childrenSelectors: string, handler: ( event: Event ) => void ) => void;
	off: ( event: string, childrenSelectors: string, handler?: ( event: Event ) => void ) => void;
};

export type BackboneModel< Model extends object > = {
	cid?: string;
	get: < T extends keyof Model >( key: T ) => Model[ T ];
	set: < T extends keyof Model >( key: T, value: Model[ T ] ) => void;
	toJSON: () => ToJSON< Model >;
	trigger: ( event: string, ...args: unknown[] ) => void;
};

export type BackboneModelConstructor< Model extends object > = {
	new ( ...args: unknown[] ): BackboneModel< Model >;
	extend: < ExtendedModel extends object >(
		properties: Record< string, unknown >
	) => BackboneModelConstructor< ExtendedModel >;
	prototype: {
		initialize: ( attributes: unknown, options: unknown ) => void;
	};
	getModel: () => BackboneModelConstructor< Model >;
};

type BackboneCollection< Model extends object > = {
	models: BackboneModel< Model >[];
	forEach: ( callback: ( model: BackboneModel< Model > ) => void ) => void;
};

export type ElementModel = {
	id: string;
	elType: string;
	settings: BackboneModel< Props >;
	editor_settings: Record< string, unknown >;
	widgetType: string;
	editSettings?: BackboneModel< { inactive?: boolean } >;
	elements?: BackboneCollection< ElementModel >;
	config: {
		allowed_child_types?: string[];
	};
};

type ToJSON< T > = {
	[ K in keyof T ]: T[ K ] extends BackboneModel< infer M > ? ToJSON< M > : T[ K ];
};

type ContextMenuGroup = {
	name: string;
	actions: unknown[];
};

export type ReplacementSettings = {
	getSetting: ( key: string ) => unknown;
	setSetting: ( key: string, value: PropValue ) => void;
	type: string;
	id: string;
	element: HTMLElement;
	refreshView: () => void;
};
