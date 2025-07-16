import { useQuery } from '@elementor/query';

import { enqueueFont } from '../enqueue-font';
import { usePosts } from './use-posts';

export const useSuggestions = () => {
	const { data: posts } = usePosts();

	console.log( { posts } );

	return useQuery( {
		queryKey: [ 'styles-migration-suggestions' ],
		queryFn: mockApi,
	} );
};

type Usage = {
	elementType: string;
	count: number;
};

export type VariableSuggestion = {
	label: string;
	value: string;
	usages: {
		total: number;
		byType: Usage[];
	};
};

type ClassSuggestion = {
	label: string;
	usages: Usage[];
};

export type VariableType = 'color' | 'font' | 'size';

export type Suggestions = {
	variables: Record< VariableType, VariableSuggestion[] >;
	classes: ClassSuggestion[];
};

function getRandomLabel( type: VariableType ): string {
	return `${ type }-${ Math.random().toString( 36 ).substring( 2, 7 ) }`;
}

function mapToVariables( mock: any ) {
	const payload = {
		color: [],
		font: [],
		size: [],
	};

	if ( mock.font_families ) {
		payload.font = Object.entries( mock.font_families ).map( ( [ key, meta ] ) => {
			return {
				label: ( meta?.label ?? '' ).toLowerCase().split( ' ' ).join( '-' ),
				value: meta?.value ?? '',
				usages: {
					total: meta?.totalOccurrences ?? 0,
					byType: [ { count: meta?.totalOccurrences ?? 0, elementType: 'widget' } ],
				},
			};
		} );
	}

	if ( mock.colors ) {
		payload.color = Object.entries( mock.colors ).map( ( [ key, meta ] ) => {
			return {
				label: ( meta?.global?.title ?? '' ).toLowerCase().split( ' ' ).join( '-' ),
				value: meta?.global?.value ?? '',
				usages: {
					total: meta?.totalOccurrences ?? 0,
					byType: [ { count: meta?.totalOccurrences ?? 0, elementType: 'widget' } ],
				},
			};
		} );
	}

	console.log( ' ai-2-vars-classes', payload );

	return payload;
}

function mapToClasses( mock: any ) {
	return [
		{
			label: 'custom-class',
			usages: [
				{ elementType: 'section', count: 4 },
				{ elementType: 'column', count: 2 },
			],
		},
	];
}

const fontEnqueue = ( value: string ): void => {
	if ( ! value ) {
		return;
	}

	try {
		enqueueFont( value );
	} catch {
		// This prevents font enqueueing failures from breaking variable updates
	}
};

function mockApi(): Promise< Suggestions > {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			const variables = mapToVariables( mock );

			console.log( 'fonts', variables.font );

			variables.font.forEach( ( font ) => {
				console.log( 'font', font );
				fontEnqueue( font?.value );
			} );

			resolve( {
				variables: mapToVariables( mock ),
				classes: mapToClasses( mock ),
			} );
		}, 0 );
	} );
}

const mock = {
	font_families: {
		Karla: {
			totalOccurrences: 52,
			properties: {
				typography_font_family: {
					totalOccurrences: 52,
					elements: {
						'text-editor': 7,
						button: 4,
						'image-box': 12,
						'icon-box': 8,
						heading: 8,
						'call-to-action': 10,
						posts: 3,
					},
				},
			},
			global_title: 'Text',
			value: 'Roboto',
			label: 'font-body',
		},
		Pridi: {
			totalOccurrences: 5,
			properties: {
				typography_font_family: {
					totalOccurrences: 5,
					elements: {
						heading: 5,
					},
				},
			},
			global_title: 'Hero Main Title / Menu Links',
			value: 'Aclonica',
			label: 'font-heading',
		},
	},
	colors: {
		'#FFFFFF': {
			totalOccurrences: 48,
			properties: {
				title_color: {
					totalOccurrences: 24,
					elements: {
						widget: 24,
					},
				},
				text_color: {
					totalOccurrences: 7,
					elements: {
						widget: 7,
					},
				},
				background_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				hover_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				description_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				content_bg_color: {
					totalOccurrences: 2,
					elements: {
						widget: 2,
					},
				},
				classic_title_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
				classic_meta_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
				classic_excerpt_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: {
				id: 'primary',
				title: 'Primary',
				value: '#FFFFFF',
			},
		},
		'#000000': {
			totalOccurrences: 17,
			properties: {
				button_text_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				button_background_hover_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				button_hover_border_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				border_color: {
					totalOccurrences: 4,
					elements: {
						widget: 4,
					},
				},
				primary_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: {
				id: 'accent',
				title: 'Accent',
				value: '#000000',
			},
		},
		'#FFD639': {
			totalOccurrences: 1,
			properties: {
				content_bg_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: {
				id: '3acf0985',
				title: 'Yellow Element',
				value: '#FFD639',
			},
		},
		'#2F2F2F': {
			totalOccurrences: 10,
			properties: {
				title_color: {
					totalOccurrences: 5,
					elements: {
						widget: 5,
					},
				},
				description_color: {
					totalOccurrences: 5,
					elements: {
						widget: 5,
					},
				},
			},
			global: {
				id: '24ba2939',
				title: 'Dark Grey Element',
				value: '#2F2F2F',
			},
		},
		'#FFFFFF00': {
			totalOccurrences: 5,
			properties: {
				overlay_color_hover: {
					totalOccurrences: 5,
					elements: {
						widget: 5,
					},
				},
			},
			global: {
				id: 'f15c3f1',
				title: 'Full Transparency ',
				value: '#FFFFFF00',
			},
		},
		'#FF771F': {
			totalOccurrences: 1,
			properties: {
				content_bg_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: {
				id: '8b2c1dd',
				title: 'Orange BG',
				value: '#FF771F',
			},
		},
		'#F2F2F2': {
			totalOccurrences: 1,
			properties: {
				content_bg_color: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: {
				id: '1360403',
				title: 'Pale Grey BG',
				value: '#F2F2F2',
			},
		},
	},
	typography: {
		'': {
			totalOccurrences: 1,
			properties: {
				typography_typography: {
					totalOccurrences: 1,
					elements: {
						widget: 1,
					},
				},
			},
			global: null,
		},
	},
	spacing: [],
};
