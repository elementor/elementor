import { useQuery } from '@elementor/query';

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

type VariableSuggestion = {
	label: string;
	value: string;
	usages: Usage[];
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

function mockApi(): Promise< Suggestions > {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			resolve( {
				variables: {
					color: [
						{
							label: getRandomLabel( 'color' ),
							value: '#ff5733',
							usages: [
								{ elementType: 'button', count: 5 },
								{ elementType: 'text', count: 3 },
							],
						},
						{
							label: getRandomLabel( 'color' ),
							value: '#33c1ff',
							usages: [
								{ elementType: 'button', count: 2 },
								{ elementType: 'text', count: 4 },
							],
						},
					],
					font: [
						{
							label: getRandomLabel( 'font' ),
							value: 'Arial, sans-serif',
							usages: [
								{ elementType: 'heading', count: 10 },
								{ elementType: 'text', count: 2 },
							],
						},
					],
					size: [
						{
							label: getRandomLabel( 'size' ),
							value: '16px',
							usages: [
								{ elementType: 'text', count: 8 },
								{ elementType: 'button', count: 3 },
							],
						},
						{
							label: getRandomLabel( 'size' ),
							value: '24px',
							usages: [
								{ elementType: 'heading', count: 6 },
								{ elementType: 'text', count: 1 },
							],
						},
					],
				},
				classes: [
					{
						label: 'custom-class',
						usages: [
							{ elementType: 'section', count: 4 },
							{ elementType: 'column', count: 2 },
						],
					},
				],
			} );
		}, 1000 );
	} );
}

const mock = {
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
