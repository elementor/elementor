import { type V1Element } from '@elementor/editor-elements';
import { type Props, type PropValue } from '@elementor/editor-props';

import { type TransformerRenderContext } from '../transformers/types';

export type LegacyWindow = Window & {
	elementor: {
		createBackboneElementsCollection: ( children: unknown ) => BackboneCollection< ElementModel >;
		getElementData: ( model: unknown ) => { title: string };

		modules: {
			elements: {
				types: {
					Widget: typeof ElementType;
				};
				views: {
					Widget: typeof ElementView;
				};
			};
		};
		elementsManager: {
			registerElementType: ( type: ElementType ) => void;
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

export declare class ElementType {
	getType(): string;

	getView(): typeof ElementView;
}

export declare class ElementView {
	container: V1Element;

	$el: JQueryElement;
	el: HTMLElement;

	model: BackboneModel< ElementModel >;

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

	isRendered: boolean;

	_currentRenderPromise?: Promise< void >;

	options?: {
		model: BackboneModel< ElementModel >;
	};

	ui(): Record< string, unknown >;

	events(): Record< string, unknown >;

	_parent?: ElementView;

	getRenderContext(): TransformerRenderContext | undefined;
}

type JQueryElement = {
	find: ( selector: string ) => JQueryElement;
	html: ( html: string ) => void;
	get: ( index: number ) => HTMLElement;
	attr: ( name: string ) => string;
	on: ( event: string, childrenSelectors: string, handler: ( event: Event ) => void ) => void;
	off: ( event: string, childrenSelectors: string, handler?: ( event: Event ) => void ) => void;
};

export type BackboneModel< Model extends object > = {
	get: < T extends keyof Model >( key: T ) => Model[ T ];
	set: < T extends keyof Model >( key: T, value: Model[ T ] ) => void;
	toJSON: () => ToJSON< Model >;
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
	settings: BackboneModel< Props >;
	editor_settings: Record< string, unknown >;
	widgetType: string;
	editSettings?: BackboneModel< { inactive?: boolean } >;
	elements?: BackboneCollection< ElementModel >;
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
