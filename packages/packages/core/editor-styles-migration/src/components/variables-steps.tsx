import * as React from 'react';
import { useState } from 'react';
import { createVariables, type Variable } from '@elementor/editor-variables';
import { Checkbox, DialogActions, Stack, Step, StepLabel, Stepper, UnstableColorIndicator } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type Suggestions, type VariableSuggestion, type VariableType } from '../hooks/use-suggestions';
import { useStylesMigrationContext } from './steps-dialog';

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

	return (
		<Stack sx={ { flexGrow: 1, height: '100%' } }>
			<Stack sx={ { flexGrow: 1 } }>
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
			<DialogActions>
				<Stepper activeStep={ currentStep } sx={ { width: '450px' } }>
					{ steps.map( ( { key }, index ) => {
						const stepProps: { completed?: boolean } = {};
						const labelProps: {
							optional?: React.ReactNode;
						} = {};

						return (
							<Step key={ index } { ...stepProps } onClick={ () => setCurrentStep( index ) }>
								<StepLabel { ...labelProps }>{ getLabel( key as VariableType ) }</StepLabel>
							</Step>
						);
					} ) }
				</Stepper>
			</DialogActions>
		</Stack>
	);
};

function getLabel( type: VariableType ) {
	return {
		color: __( 'Colors', 'elementor' ),
		font: __( 'Font family', 'elementor' ),
		size: __( 'Spacing', 'elementor' ),
	}[ type ];
}

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