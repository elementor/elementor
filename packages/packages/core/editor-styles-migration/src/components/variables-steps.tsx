import * as React from 'react';
import { useState } from 'react';
import { createVariables, type Variable } from '@elementor/editor-variables';
import { AIIcon, BrushIcon, CurrentLocationIcon, ExpandDiagonalIcon, TextIcon } from '@elementor/icons';
import {
	Alert,
	Button,
	CircularProgress,
	DialogActions,
	Infotip,
	Paper,
	Stack,
	Step,
	StepLabel,
	Stepper,
	Switch,
	Typography,
	UnstableColorIndicator,
	UnstableTag,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type VariableSuggestion, type VariableType } from '../hooks/use-suggestions';
import { useDialog, useStylesMigrationContext } from './steps-dialog';

const roles = [ __( 'primary', 'elementor' ), __( 'secondary', 'elementor' ), __( 'tertiary', 'elementor' ) ];


const FOOTER_HEIGHT = '70px';

export const VariablesSteps = () => {
	const { variables = {}, isLoading } = useStylesMigrationContext();
	const [ currentStep, setCurrentStep ] = useState( 0 );
    const  {setOpen}  =  useDialog();
    const [submitting, setSubmitting] = useState( false );
	const [ selectedVariables, setSelectedVariables ] = useState< Record< string, boolean > >( {} );

	if ( isLoading ) {
		return <CircularProgress />;
	}

	const steps = Object.entries( variables as Suggestions[ 'variables' ] ).map( ( [ key, list ] ) => {
		return {
			key,
			list,
		};
	} );

	const step = steps[ currentStep ];

	async function handleCreate() {
        setSubmitting( true );
        const filteredList = steps.map(step => {
            return {
                key: step.key,
                list: step.list.filter( variable => selectedVariables[ variable.value ] ),
            }
        })

		const variablesToCreate: Record< string, Variable > = filteredList.reduce(
			( acc, {list, key} ) => {
				list.forEach( ( variable ) => {
                    const id = generateId( getType( key as VariableType ) );
                    acc[ id ] = {
                        type: getType( key as VariableType ),
                        value: variable.value,
                        label: variable.label,
                    };
                } );
                return acc;
			},
			{} as Record< string, Variable >
		);

		await createVariables( variablesToCreate );

        setSubmitting( false );
        setOpen( false );
	}

	const list = step?.list;;

	const Icon = getIcon( step.key as VariableType );

	return (
		<Stack sx={ { flexGrow: 1, paddingBottom: '100px' } }>
			<Stack alignItems="center" sx={ { pt: 4 } }>
				<Stack direction="row" gap={ 0.5 } alignItems="center">
					<Icon fontSize="medium" />
					<Typography variant="h5">{ getLabel( step.key as VariableType ) }</Typography>
				</Stack>
				<Typography variant="body1" color="text.secondary">
					{ `${ list.length } variables detected from your website` }
				</Typography>
			</Stack>
			<Stack gap={ 2 } sx={ { flexBasis: '100%', flexGrow: 1, p: 4, pt: 3 } }>
				{ list.map( ( variable, index ) => (
					<Paper
						key={ index }
						variant="outlined"
						sx={ {
							p: 2,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						} }
					>
						<Stack direction="row" alignItems="center" justifyContent="start" gap={ 2 }>
							<VariablePreview variable={ variable } type={ step.key as VariableType } />
							<VariableExplanation variable={ variable } />
						</Stack>
						<Stack direction="row" alignItems="center" justifyContent="end" gap={ 2 }>
							<VariableUsage
								variable={ variable }
								type={ step.key as VariableType }
								role={ roles[ index ] }
							/>
							<Switch
								onClick={ () => {
									setSelectedVariables( ( prev ) => ( {
										...prev,
										[ variable.value ]: ! prev[ variable.value ],
									} ) );
								} }
								checked={ selectedVariables[ variable.value ] ?? false }
							/>
						</Stack>
					</Paper>
				) ) }
			</Stack>
			<DialogActions sx={ { borderTop: '1px solid', borderColor: 'divider' , backgroundColor: 'background.paper',justifyContent: 'space-between', position: 'absolute', bottom: 0, height: FOOTER_HEIGHT, width: '100%' } }>
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
					<Button
						color="secondary"
						onClick={ () => {
							setCurrentStep( ( prev ) => ( prev < steps.length - 1 ? prev + 1 : prev ) );
						} }
					>
						Skip
					</Button>
					<Button onClick={ handleCreate } variant="contained" color="primary" loading={submitting}>
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
		size: __( 'Font size', 'elementor' ),
	}[ type ];
}

function getIcon( type: VariableType ) {
	return {
		color: BrushIcon,
		font: TextIcon,
		size: ExpandDiagonalIcon,
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
	if ( type === 'color' ) {
		return <UnstableColorIndicator value={ variable.value } size="small" />;
	}

	if ( type === 'font' ) {
		return (
			<Paper color="secondary" sx={ { p: 2, fontSize: '16px' } } elevation={ 0 }>
				<span style={ { fontFamily: variable.value } }>{ __( 'Example Text', 'elementor' ) }</span>
			</Paper>
		);
	}

	if ( type === 'size' ) {
		return (
			<Paper color="secondary" sx={ { p: 2 } } elevation={ 0 }>
				<span style={ { fontSize: variable.value } }>{ __( 'Aa', 'elementor' ) }</span>
			</Paper>
		);
	}

	return <span>{ variable.label }</span>;
}

function VariableExplanation( { variable }: { variable: VariableSuggestion } ) {
	return (
		<Stack direction="column" gap={ 0.5 }>
			<Typography variant="subtitle1">{ variable.label }</Typography>
			<Typography variant="caption" color="text.secondary">
				{ variable.value }
			</Typography>
		</Stack>
	);
}

function VariableUsage( {
	variable,
	type,
	role,
}: {
	variable: VariableSuggestion;
	type: VariableType;
	role: string | null;
} ) {
	return (
		<Infotip
			anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
			content={ <VariableUsedAt variable={ variable } type={ type } role={ role } /> }
		>
			<UnstableTag
				label={ variable.usages.total + ' ' + __( 'Uses', 'elementor' ) }
				startIcon={ <CurrentLocationIcon /> }
			/>
		</Infotip>
	);
}

function VariableUsedAt( {
	variable,
	type,
	role,
}: {
	variable: VariableSuggestion;
	type: VariableType;
	role: string | null;
} ) {
	return (
		<Stack direction="column" gap={ 1 } sx={ { p: 2 } }>
			<Typography variant="subtitle2" sx={{ mb: 1 }}>
				{ __( '%s appears in:', 'elementor' ).replace( '%s', variable.value ) }
			</Typography>
			{ variable.usages.byType.map( ( usage ) => (
				<Stack direction="row" gap={ 1 } key={ usage.elementType }>
					<UnstableTag label={ usage.count } />
					<Typography variant="caption">{ usage.elementType }</Typography>
				</Stack>
			) ) }
			{ role && (
				<Alert color="accent" sx={ { mt: 2 } } icon={ <AIIcon fontSize="small" /> }>
					{ __( 'This is likely a %s %d', 'elementor' )
						.replace( '%s', role ?? '' )
						.replace( '%d', type ) }
				</Alert>
			) }
		</Stack>
	);
}
