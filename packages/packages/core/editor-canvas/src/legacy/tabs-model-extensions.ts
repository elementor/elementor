export type ModelExtensions = Record< string, unknown >;

export const tabModelExtensions: ModelExtensions = {
	modifyDefaultChildren( this: { get: ( key: string ) => unknown }, elements: unknown[] ): unknown[] {
		if ( ! Array.isArray( elements ) || elements.length === 0 ) {
			return elements;
		}

		const [ paragraph ] = elements;
		const editorSettings = this.get( 'editor_settings' ) as { initial_position?: number } | undefined;
		const position = editorSettings?.initial_position;

		if ( ! position || ! paragraph || typeof paragraph !== 'object' ) {
			return elements;
		}
		const paragraphSettings = ( paragraph as { settings?: unknown } ).settings as { paragraph?: unknown };

		const updatedParagraph = {
			...paragraph,
			settings: {
				...paragraphSettings,
				paragraph: {
					$$type: 'html',
					value: `Tab ${ position }`,
				},
			},
		};

		return [ updatedParagraph, ...elements.slice( 1 ) ];
	},
};

export function getTabsModelExtensions( type: string ): ModelExtensions | undefined {
	const extensionsMap: Record< string, ModelExtensions > = {
		'e-tab': tabModelExtensions,
	};

	return extensionsMap[ type ];
}

export function createExtendedModel(
	baseModelClass: new ( ...args: unknown[] ) => unknown,
	extensions: ModelExtensions
): new ( ...args: unknown[] ) => unknown {
	return baseModelClass.extend( extensions ) as new ( ...args: unknown[] ) => unknown;
}
