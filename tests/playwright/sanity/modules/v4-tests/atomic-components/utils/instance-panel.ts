import { type Page } from '@playwright/test';
import EditorPage from '../../../../../pages/editor-page';
import { captureNextElementCreation } from '../../../../../assets/elements-utils';

type ComponentData = { id: number; name: string; uid: string; isArchived: boolean };

type OverridablePropEntry = {
	overrideKey: string;
	label: string;
	elementId: string;
	propKey: string;
	elType: string;
	widgetType: string;
	originValue: object;
	groupId: string;
};

type ComponentPayload = {
	status: 'publish';
	items: Array< {
		uid: string;
		title: string;
		elements: object[];
		settings: {
			overridable_props: {
				props: Record< string, OverridablePropEntry >;
				groups: {
					items: Record< string, { id: string; label: string; props: string[] } >;
					order: string[];
				};
			};
		};
	} >;
};

export const getComponentByName = async ( page: Page, name: string ): Promise< ComponentData | null > => {
	return page.evaluate( async ( componentName ) => {
		const nonce = ( window as unknown as { wpApiSettings?: { nonce: string } } ).wpApiSettings?.nonce ?? '';
		const res = await fetch( '/wp-json/elementor/v1/components', {
			headers: { 'X-WP-Nonce': nonce },
		} );
		const json = await res.json() as { data: ComponentData[] };
		return json.data.find( ( c ) => c.name === componentName ) ?? null;
	}, name );
};

const createComponentViaApi = async ( page: Page, payload: ComponentPayload ): Promise< number > => {
	return page.evaluate( async ( data ) => {
		const nonce = ( window as unknown as { wpApiSettings?: { nonce: string } } ).wpApiSettings?.nonce ?? '';
		const res = await fetch( '/wp-json/elementor/v1/components', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce,
			},
			body: JSON.stringify( data ),
		} );

		if ( ! res.ok ) {
			const error = await res.json();
			throw new Error( `Component creation failed: ${ JSON.stringify( error ) }` );
		}

		const json = await res.json() as { data: Record< string, number > };
		const id = Object.values( json.data )[ 0 ];
		if ( ! id ) {
			throw new Error( 'Component creation returned no ID' );
		}
		return id;
	}, payload );
};

const BASIC_FLEXBOX_ID = 'e2ebasicflex';
const BASIC_HEADING_ID = 'e2ebasichead';
const BASIC_PROP_ID = 'e2epropbasic';
const BASIC_GROUP_ID = 'e2egroupbasic';

export const createBasicComponent = async ( page: Page, name: string ): Promise< number > => {
	return createComponentViaApi( page, {
		status: 'publish',
		items: [ {
			uid: `e2e-basic-${ Date.now() }`,
			title: name,
			elements: [ {
				id: BASIC_FLEXBOX_ID,
				elType: 'e-flexbox',
				settings: {},
				elements: [ {
					id: BASIC_HEADING_ID,
					elType: 'widget',
					widgetType: 'e-heading',
					settings: {
						title: { $$type: 'escaped-html', value: 'Hello World' },
					},
					elements: [],
				} ],
			} ],
			settings: {
				overridable_props: {
					props: {
						[ BASIC_PROP_ID ]: {
							overrideKey: BASIC_PROP_ID,
							label: 'Title',
							elementId: BASIC_HEADING_ID,
							propKey: 'title',
							elType: 'widget',
							widgetType: 'e-heading',
							originValue: { $$type: 'escaped-html', value: 'Hello World' },
							groupId: BASIC_GROUP_ID,
						},
					},
					groups: {
						items: {
							[ BASIC_GROUP_ID ]: {
								id: BASIC_GROUP_ID,
								label: 'Content',
								props: [ BASIC_PROP_ID ],
							},
						},
						order: [ BASIC_GROUP_ID ],
					},
				},
			},
		} ],
	} );
};

const VIDEO_FLEXBOX_ID = 'e2evideoflex';
const VIDEO_ELEMENT_ID = 'e2evideoelem';
const VIDEO_PROP_ID = 'e2epropvideo';
const VIDEO_GROUP_ID = 'e2egroupvideo';

export const createVideoComponent = async ( page: Page, name: string ): Promise< number > => {
	return createComponentViaApi( page, {
		status: 'publish',
		items: [ {
			uid: `e2e-video-${ Date.now() }`,
			title: name,
			elements: [ {
				id: VIDEO_FLEXBOX_ID,
				elType: 'e-flexbox',
				settings: {},
				elements: [ {
					id: VIDEO_ELEMENT_ID,
					elType: 'widget',
					widgetType: 'e-self-hosted-video',
					settings: {
						controls: { $$type: 'boolean', value: true },
					},
					elements: [],
				} ],
			} ],
			settings: {
				overridable_props: {
					props: {
						[ VIDEO_PROP_ID ]: {
							overrideKey: VIDEO_PROP_ID,
							label: 'Allow Download',
							elementId: VIDEO_ELEMENT_ID,
							propKey: 'download',
							elType: 'widget',
							widgetType: 'e-self-hosted-video',
							originValue: { $$type: 'boolean', value: false },
							groupId: VIDEO_GROUP_ID,
						},
					},
					groups: {
						items: {
							[ VIDEO_GROUP_ID ]: {
								id: VIDEO_GROUP_ID,
								label: 'Video',
								props: [ VIDEO_PROP_ID ],
							},
						},
						order: [ VIDEO_GROUP_ID ],
					},
				},
			},
		} ],
	} );
};

const addComponentInstanceToCanvas = async (
	page: Page,
	editor: EditorPage,
	componentId: number,
): Promise< string > => {
	const instanceIdPromise = captureNextElementCreation( editor, 'e-component' );

	await page.evaluate( ( id ) => {
		type EWindow = {
			$e: { run: ( cmd: string, args: object ) => unknown };
			elementor: { getContainer: ( id: string ) => unknown };
			Backbone: { Model: new ( attrs?: object ) => object };
		};
		const win = window as unknown as EWindow;

		const docContainer = win.elementor.getContainer( 'document' );
		const flexboxContainer = win.$e.run( 'document/elements/create', {
			model: { elType: 'e-flexbox' },
			container: docContainer,
		} );

		win.$e.run( 'document/elements/import', {
			model: new win.Backbone.Model( { title: 'Component' } ),
			data: {
				content: [ {
					id: 'e2ecomp' + Math.random().toString( 36 ).substr( 2, 8 ),
					elType: 'widget',
					widgetType: 'e-component',
					settings: {
						component_instance: {
							$$type: 'component-instance',
							value: {
								component_id: { $$type: 'number', value: id },
								overrides: { $$type: 'overrides', value: [] },
							},
						},
					},
					elements: [],
				} ],
			},
			container: flexboxContainer,
		} );
	}, componentId );

	return instanceIdPromise;
};

export const addBasicInstanceToCanvas = async (
	page: Page,
	editor: EditorPage,
	componentId: number,
): Promise< string > => {
	const instanceId = await addComponentInstanceToCanvas( page, editor, componentId );

	await editor.getPreviewFrame()
		.locator( `[data-id="${ instanceId }"] [data-widget_type="e-heading.default"]` )
		.waitFor();

	return instanceId;
};

export const addVideoInstanceToCanvas = async (
	page: Page,
	editor: EditorPage,
	componentId: number,
): Promise< string > => {
	const instanceId = await addComponentInstanceToCanvas( page, editor, componentId );

	await editor.getPreviewFrame()
		.locator( `[data-id="${ instanceId }"] [data-widget_type="e-self-hosted-video.default"]` )
		.waitFor();

	return instanceId;
};
