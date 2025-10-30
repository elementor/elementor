import { type Props } from '@elementor/editor-props';

export type LegacyWindow = Window & {
	elementor: {
		createBackboneElementsCollection: ( children: unknown ) => BackboneCollection< ElementModel >;

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
		$preview: [
			{
				contentWindow: {
					dispatchEvent: ( event: Event ) => void;
				};
			},
		];
	};
};

export declare class ElementType {
	getType(): string;

	getView(): typeof ElementView;
}

export declare class ElementView {
	$el: JQueryElement;

	model: BackboneModel< ElementModel >;

	collection: BackboneCollection< ElementModel >;

	children: {
		length: number;
		findByIndex: ( index: number ) => ElementView;
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

	attachBuffer( collectionView: this, buffer: DocumentFragment ): void;

	triggerMethod( method: string, ...args: unknown[] ): void;

	bindUIElements(): void;

	_ensureViewIsIntact(): void;

	_isRendering: boolean;

	resetChildViewContainer(): void;

	isRendered: boolean;

	options?: {
		model: BackboneModel< ElementModel >;
	};

	ui(): Record< string, unknown >;

	events(): Record< string, unknown >;
}

type JQueryElement = {
	find: ( selector: string ) => JQueryElement;
	html: ( html: string ) => void;
	get: ( index: number ) => HTMLElement;
};

export type BackboneModel< Model extends object > = {
	get: < T extends keyof Model >( key: T ) => Model[ T ];
	set: < T extends keyof Model >( key: T, value: Model[ T ] ) => void;
	toJSON: () => ToJSON< Model >;
};

type BackboneCollection< Model extends object > = {
	models: BackboneModel< Model >[];
	forEach: ( callback: ( model: BackboneModel< Model > ) => void ) => void;
};

export type ElementModel = {
	id: string;
	settings: BackboneModel< Props >;
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
