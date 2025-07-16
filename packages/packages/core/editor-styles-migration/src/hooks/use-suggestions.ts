import { useQuery } from '@elementor/query';

import { enqueueFont } from '../enqueue-font';
import { usePosts } from './use-posts';
import { ObjectFitField } from '../../../editor-editing-panel/src/components/style-sections/size-section/object-fit-field';

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

	if (  mock.font_sizes ) {
			payload.size = Object.entries( mock.font_sizes ).map( ( [ key, meta ] ) => {
			return {
				label: ( meta?.label ?? '' ),
				value: meta?.value ?? '',
				usages: {
					total: meta?.totalOccurrences ?? 0,
					byType: Object.entries( meta?.elements ?? {} ).map( ( [ elementType, count ] ) => ( {
						elementType,
						count,
					} ) ),
				},
			};
		} );

	}

	if ( mock.font_families ) {
		payload.font = Object.entries( mock.font_families ).map( ( [ key, meta ] ) => {
			return {
				label: ( meta?.label ?? '' ),
				value: meta?.value ?? '',
				usages: {
					total: meta?.totalOccurrences ?? 0,
					byType: Object.entries( meta?.elements ?? {} ).map( ( [ elementType, count ] ) => ( {
						elementType,
						count,
					} ) ),
				},
			};
		} );
	}

	if ( mock.colors ) {
		payload.color = Object.entries( mock.colors ).map( ( [ key, meta ] ) => {
			return {
				label: ( meta?.label ?? '' ),
				value: meta?.value ?? '',
				usages: {
					total: meta?.totalOccurrences ?? 0,
					byType: Object.entries( meta?.elements ?? {} ).map( ( [ elementType, count ] ) => ( {
						elementType,
						count,
					} ) ),
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
    "colors": [
        {
            "totalOccurrences": 34,
            "elements": {
                "heading": 5,
                "text-editor": 5,
                "button": 10,
                "form": 7,
                "icon-box": 6,
                "image-box": 1
            },
            "global_title": "Primary",
            "label": "color-primary",
            "value": "#FFFFFF"
        },
        {
            "totalOccurrences": 23,
            "elements": {
                "button": 14,
                "icon": 3,
                "form": 6
            },
            "global_title": "Accent",
            "label": "color-accent",
            "value": "#000000"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "form": 1,
                "button": 2
            },
            "global_title": "Full Transparency ",
            "label": "color-transparent",
            "value": "#FFFFFF00"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "form": 1
            },
            "global_title": "Yellow Element",
            "label": "color-button-hover-yellow",
            "value": "#FFD639"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "global_title": "Pink Element",
            "label": "color-border-pink",
            "value": "#FF7989"
        }
    ],
    "font_families": [
        {
            "totalOccurrences": 18,
            "elements": {
                "text-editor": 5,
                "button": 5,
                "form": 2,
                "icon-box": 6
            },
            "global_title": "Text",
            "label": "font-body",
            "value": "Karla"
        },
        {
            "totalOccurrences": 5,
            "elements": {
                "heading": 5
            },
            "global_title": "Hero Main Title \/ Menu Links",
            "label": "font-heading",
            "value": "Pridi"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "heading": 1
            },
            "label": "font-display",
            "value": "Protest Guerrilla"
        }
    ],
    "font_sizes": [
        {
            "totalOccurrences": 9,
            "elements": {
                "text-editor": 5,
                "form": 1,
                "icon-box": 3
            },
            "global_title": "Text",
            "label": "text-base",
            "value": "16px"
        },
        {
            "totalOccurrences": 6,
            "elements": {
                "button": 5,
                "form": 1
            },
            "global_title": "Accent",
            "label": "text-sm",
            "value": "14px"
        },
        {
            "totalOccurrences": 5,
            "elements": {
                "heading": 5
            },
            "global_title": "Hero Main Title \/ Menu Links",
            "label": "text-display",
            "value": "74px"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "icon-box": 3
            },
            "global_title": "Secondary",
            "label": "text-lg",
            "value": "24px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "heading": 1
            },
            "label": "text-2xl",
            "value": "34px"
        }
    ],
    "spacing": [
        {
            "totalOccurrences": 14,
            "elements": {
                "section": 14
            },
            "value": "4%"
        },
        {
            "totalOccurrences": 12,
            "elements": {
                "section": 8,
                "icon": 3,
                "image-box": 1
            },
            "value": "10px"
        },
        {
            "totalOccurrences": 10,
            "elements": {
                "section": 10
            },
            "value": "6%"
        },
        {
            "totalOccurrences": 8,
            "elements": {
                "section": 8
            },
            "value": "8%"
        },
        {
            "totalOccurrences": 6,
            "elements": {
                "button": 6
            },
            "value": "16px"
        },
        {
            "totalOccurrences": 6,
            "elements": {
                "button": 6
            },
            "value": "80px"
        },
        {
            "totalOccurrences": 4,
            "elements": {
                "section": 4
            },
            "value": "10%"
        },
        {
            "totalOccurrences": 4,
            "elements": {
                "text-editor": 3,
                "button": 1
            },
            "value": "20px"
        },
        {
            "totalOccurrences": 4,
            "elements": {
                "icon": 3,
                "image-box": 1
            },
            "value": "-22px"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "section": 3
            },
            "value": "16%"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "section": 3
            },
            "value": "-100px"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "button": 3
            },
            "value": "5px"
        },
        {
            "totalOccurrences": 3,
            "elements": {
                "icon": 3
            },
            "value": "-40px"
        },
        {
            "totalOccurrences": 2,
            "elements": {
                "section": 2
            },
            "value": "-200px"
        },
        {
            "totalOccurrences": 2,
            "elements": {
                "section": 2
            },
            "value": "35%"
        },
        {
            "totalOccurrences": 2,
            "elements": {
                "form": 2
            },
            "value": "90px"
        },
        {
            "totalOccurrences": 2,
            "elements": {
                "section": 2
            },
            "value": "50px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "-135px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "100px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "30%"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "text-editor": 1
            },
            "value": "40%"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "form": 1
            },
            "value": "12px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "form": 1
            },
            "value": "11px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "30px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "60px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "56px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "section": 1
            },
            "value": "15%"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "button": 1
            },
            "value": "2px"
        },
        {
            "totalOccurrences": 1,
            "elements": {
                "button": 1
            },
            "value": "40px"
        }
    ]
}