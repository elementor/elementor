import * as React from 'react';
import { useState } from 'react';
import { createVariables, type Variable } from '@elementor/editor-variables';
import { Alert, Button, Checkbox, DialogActions, Infotip, Paper, Stack, Step, StepLabel, Stepper, Typography, UnstableColorIndicator, UnstableTag } from '@elementor/ui';
import { VariableSuggestion, type Suggestions, type VariableType } from '../hooks/use-suggestions';
import { useStylesMigrationContext } from './steps-dialog';

import { __ } from '@wordpress/i18n';
import { CurrentLocationIcon } from '@elementor/icons';

const roles = [__('primary', 'elementor'), __('secondary', 'elementor'), __('tertiary', 'elementor')];

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
		<Stack sx={ { flexGrow: 1 } }>
			<Stack direction="row" sx={ { flexGrow: 1 } }>
				<Stack sx={ { flexBasis: '100%' } }>
					{ step?.list.map( ( variable, index ) => (
						<Stack
							key={ index }
							direction="row"
							alignItems="center"
							justifyContent="space-between"
							sx={ { padding: '10px', borderBottom: '1px solid gray' } }
						>
							<Stack direction="row" alignItems="center" justifyContent="start" gap={ 2 }>
								<VariablePreview variable={ variable } type={ step.key as VariableType } />
								<VariableExplanation variable={ variable } />
							</Stack>
							<Stack direction="row" alignItems="center" justifyContent="end" gap={ 2 }>
								<VariableUsage variable={ variable } type={ step.key as VariableType } role={ roles[index] } />
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
						</Stack>
					) ) }
				</Stack>
			</Stack>
			<DialogActions sx={ { justifyContent:  'space-between' } }>
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
                <Stack direction="row" spacing={ 2 }>
                    <Button color="secondary">
						Skip
					</Button>
					<Button onClick={ handleCreate } variant="contained" color="primary">
						Apply styles
					</Button>
                </Stack>
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
		return <Paper color="secondary" sx={{ p: 2, fontSize: '16px' }}><span style={{fontFamily: variable.value}}>{ __('Example Text', 'elementor') }</span></Paper>;
	}

	return <span>{ variable.label }</span>;
}

function VariableExplanation( { variable }: { variable: VariableSuggestion } ) {
	return <Stack direction="column" gap={ 1 }>
		<Typography variant="subtitle1">{ variable.label }</Typography>
		<Typography variant="caption" color="text.secondary">{ variable.value }</Typography>
	</Stack>;
}

function VariableUsage( { variable, type, role }: { variable: VariableSuggestion, type: VariableType, role: string | null } ) {
	return <Infotip 
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			content={ <VariableUsedAt  variable={variable} type={type} role={role} /> }
		>
		<UnstableTag label={
			variable.usages.total + ' ' + __('Uses', 'elementor')
		} startIcon={<CurrentLocationIcon />} />
	</Infotip>;
}

function VariableUsedAt( { variable, type, role }: { variable: VariableSuggestion, type: VariableType, role: string | null } ) {
	return <Stack direction="column" gap={ 1 } sx={{ p: 2 }}>
		<Typography variant="subtitle1">{ __('%s appears in:', 'elementor').replace('%s', variable.value) }</Typography>
		{variable.usages.byType.map(usage => (
			<Stack direction="row" gap={ 1 } key={usage.elementType}>
				<UnstableTag label={ usage.count } />
				<Typography variant="subtitle1">{ usage.elementType }</Typography>
			</Stack>
		))}
		{role && <Alert color="promotion" sx={{ mt: 2 }}>{ __('This is likely a %s %d', 'elementor').replace('%s', role ?? '').replace('%d', type) }</Alert>}
	</Stack>;
}