import * as React from 'react';
import { useState } from 'react';
import { createVariable, createVariables, type Variable } from '@elementor/editor-variables';
import { Button, Checkbox, Stack, UnstableColorIndicator } from '@elementor/ui';

import { VariableSuggestion, type Suggestions, type VariableType } from '../hooks/use-suggestions';
import { useStylesMigrationContext } from './steps-dialog';
import { __ } from '@wordpress/i18n';

export const VariablesSteps = () => {
	const { variables = {} as Suggestions[ 'variables' ] } = useStylesMigrationContext();
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ selectedVariables, setSelectedVariables ] = useState< Record< string, boolean > >( {} );

	const steps = Object.entries( variables ).map( ( [ key, list ] ) => {
		return {
			key,
			list,
		};
	} );

	const step = steps[ currentStep ];

	function handleCreate() {
		const filteredList = step?.list.filter( ( variable ) => {
			return selectedVariables[ variable.value ] ?? false;
		} );
		const variablesToCreate: Record< string, Variable > = filteredList.reduce(
			( acc, variable ) => {
				acc[ generateId( variable.value ) ] = {
					type: getType( step.key as VariableType ),
					label: variable.label,
					value: variable.value,
				};
				return acc;
			},
			{} as Record< string, Variable >
		);

		createVariables( variablesToCreate );
	}

	const handleNext = () => {
		if ( currentStep < steps.length - 1 ) {
			setCurrentStep( currentStep + 1 );
		}
	};

	const handlePrevious = () => {
		if ( currentStep > 0 ) {
			setCurrentStep( currentStep - 1 );
		}
	};

	return (
		<Stack sx={ { flexGrow: 1, padding: '20px', height: '100%' } }>
			<Stack direction="row" sx={ { flexGrow: 1 } }>
				<Stack sx={ { flexBasis: '50%', borderRight: '1px solid gray' } }>
					{ step?.list.map( ( variable, index ) => (
						<Stack
							key={ index }
							direction="row"
							alignItems="center"
							justifyContent="space-between"
							sx={ { padding: '10px', borderBottom: '1px solid gray' } }
						>
							<VariablePreview variable={ variable } type={ step.key as VariableType } />
							<Checkbox
								onClick={ () => {
									setSelectedVariables( ( prev ) => ( {
										...prev,
										[ variable.value ]: ! prev[ variable.value ],
									} ) );
								} }
								checked={ selectedVariables[ variable.value ] ?? false }
							/>
						</Stack>
					) ) }
				</Stack>
				<Stack sx={ { flexBasis: '50%' } }></Stack>
			</Stack>
			<Stack direction="row" alignItems="center">
				<Button onClick={ handleCreate } variant="contained" color="primary">
					Create
				</Button>
				<Button onClick={ handlePrevious } color="secondary">
					Previous
				</Button>
				<Button onClick={ handleNext } variant="contained">
					Next
				</Button>
			</Stack>
		</Stack>
	);
};

function getType( type: VariableType ) {
	return {
		color: 'global-color-variable',
		font: 'global-font-variable',
		size: 'global-size-variable',
	}[ type ];
}

function generateId( prefix: string = '' ): string {
	return `${ prefix }${ Math.random().toString( 36 ).substring( 2, 9 ) }`;
}

function VariablePreview( { variable, type }: { variable: VariableSuggestion; type: VariableType } ) {
	if(type === 'color') {
		return <UnstableColorIndicator value={variable.value} />
	}

	if(type === 'font') {
		return <span style={{fontFamily: variable.value}}>{ __('Example Text', 'elementor') }</span>;
	}

	return <span>{ variable.label }</span>;
}