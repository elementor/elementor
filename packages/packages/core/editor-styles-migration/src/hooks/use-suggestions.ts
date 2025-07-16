import { useQuery } from '@elementor/query';

export const useSuggestions = () => {
	return useQuery( {
		queryKey: [ 'styles-migration-suggestions' ],
		queryFn: mockApi,
	} );
};

type Usage = {
    elementType: string;
    count: number;
}

type VariableSuggestion = {
    name: string;
    usages: Usage[]
}

type ClassSuggestion = {
	name: string;
    usages: Usage[]
};

type VariableType = 'color' | 'font' | 'spacing';

export type Suggestions = {
	variables: Record< VariableType, VariableSuggestion[] >;
	classes: ClassSuggestion[];
};

function mockApi(): Promise< Suggestions > {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			resolve( {
				variables: {
                    color: [
                        {
                            name: 'Primary Color',
                            usages: [
                                { elementType: 'button', count: 5 },
                                { elementType: 'text', count: 3 },
                            ],
                        },
                        {
                            name: 'Secondary Color',
                            usages: [
                                { elementType: 'button', count: 2 },
                                { elementType: 'text', count: 4 },
                            ],
                        }
                    ],
                    font: [
                        {
                            name: 'Heading Font',
                            usages: [
                                { elementType: 'heading', count: 10 },
                                { elementType: 'text', count: 2 },
                            ],
                        },
                    ],
                    spacing: [],
                },
                classes: [
                    {
                        name: 'custom-class',
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
