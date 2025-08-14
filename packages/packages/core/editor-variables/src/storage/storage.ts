import { type Variable, type VariablesList } from './types';

const STORAGE_KEY = 'elementor-global-variables';
const STORAGE_WATERMARK_KEY = 'elementor-global-variables-watermark';

// Operation constants
export const OP_RW = 'RW';
const OP_RO = 'RO';

// Default values
const DEFAULT_WATERMARK = -1;
const DEFAULT_VARIABLES = '{}';
const DEFAULT_WATERMARK_STRING = '-1';

// Expected watermark differences for operations
const EXPECTED_RW_DIFF = 1;
const EXPECTED_RO_DIFF = 0;

export class Storage {
	private state: {
		watermark: number;
		variables: VariablesList;
	};

	constructor() {
		this.state = {
			watermark: DEFAULT_WATERMARK,
			variables: {},
		};
	}

	load(): VariablesList {
		try {
			this.loadWatermarkFromStorage();
			this.loadVariablesFromStorage();
		} catch {
			this.resetToDefaults();
		}

		return this.state.variables;
	}

	fill( variables: VariablesList, watermark: number ): void {
		this.validateInputs( variables, watermark );

		this.resetVariables();
		this.setVariables( variables );
		this.setWatermark( watermark );

		this.persistToStorage();
	}

	add( id: string, variable: Variable ): void {
		this.validateVariableId( id );
		this.validateVariable( variable );

		this.load();
		this.state.variables[ id ] = variable;
		this.persistVariablesToStorage();
	}

	update( id: string, variable: Variable ): void {
		this.validateVariableId( id );
		this.validateVariable( variable );

		this.load();
		this.state.variables[ id ] = variable;
		this.persistVariablesToStorage();
	}

	setWatermark( watermark: number ): void {
		this.validateWatermark( watermark );

		this.state.watermark = watermark;
		this.persistWatermarkToStorage();
	}

	hasWatermarkDifference( operation: string, newWatermark: number ): boolean {
		this.validateOperation( operation );
		this.validateWatermark( newWatermark );

		const diff = this.calculateWatermarkDifference( newWatermark );

		return this.isWatermarkDifferenceUnexpected( operation, diff );
	}

	private loadWatermarkFromStorage(): void {
		const storedWatermark = localStorage.getItem( STORAGE_WATERMARK_KEY ) || DEFAULT_WATERMARK_STRING;
		this.state.watermark = parseInt( storedWatermark );
	}

	private loadVariablesFromStorage(): void {
		const storedVariables = localStorage.getItem( STORAGE_KEY ) || DEFAULT_VARIABLES;
		this.state.variables = JSON.parse( storedVariables ) as VariablesList;
	}

	private resetToDefaults(): void {
		this.state.watermark = DEFAULT_WATERMARK;
		this.state.variables = {};
	}

	private resetVariables(): void {
		this.state.variables = {};
	}

	private setVariables( variables: VariablesList ): void {
		if ( this.hasVariables( variables ) ) {
			this.state.variables = variables;
		}
	}

	private hasVariables( variables: VariablesList ): boolean {
		return variables && Object.keys( variables ).length > 0;
	}

	private persistToStorage(): void {
		this.persistWatermarkToStorage();
		this.persistVariablesToStorage();
	}

	private persistWatermarkToStorage(): void {
		try {
			localStorage.setItem( STORAGE_WATERMARK_KEY, this.state.watermark.toString() );
		} catch ( error ) {
			console.error( 'Failed to persist watermark to storage:', error );
		}
	}

	private persistVariablesToStorage(): void {
		try {
			localStorage.setItem( STORAGE_KEY, JSON.stringify( this.state.variables ) );
		} catch ( error ) {
			console.error( 'Failed to persist variables to storage:', error );
		}
	}

	private calculateWatermarkDifference( newWatermark: number ): number {
		return newWatermark - this.state.watermark;
	}

	private isWatermarkDifferenceUnexpected( operation: string, diff: number ): boolean {
		if ( OP_RW === operation ) {
			return EXPECTED_RW_DIFF !== diff;
		}

		if ( OP_RO === operation ) {
			return EXPECTED_RO_DIFF !== diff;
		}

		return false;
	}

	private validateInputs( variables: VariablesList, watermark: number ): void {
		this.validateVariables( variables );
		this.validateWatermark( watermark );
	}

	private validateVariables( variables: VariablesList ): void {
		if ( null === variables || undefined === variables ) {
			throw new Error( 'Variables cannot be null or undefined' );
		}
	}

	private validateWatermark( watermark: number ): void {
		if ( 'number' !== typeof watermark || isNaN( watermark ) ) {
			throw new Error( 'Watermark must be a valid number' );
		}
	}

	private validateVariableId( id: string ): void {
		if ( ! id || 'string' !== typeof id || id.trim().length === 0 ) {
			throw new Error( 'Variable ID must be a non-empty string' );
		}
	}

	private validateVariable( variable: Variable ): void {
		if ( ! variable || 'object' !== typeof variable ) {
			throw new Error( 'Variable must be a valid object' );
		}

		if ( ! variable.label || 'string' !== typeof variable.label ) {
			throw new Error( 'Variable must have a valid label' );
		}

		if ( undefined === variable.value ) {
			throw new Error( 'Variable must have a value' );
		}
	}

	private validateOperation( operation: string ): void {
		if ( OP_RW !== operation && OP_RO !== operation ) {
			throw new Error( `Invalid operation: ${ operation }. Must be either ${ OP_RW } or ${ OP_RO }` );
		}
	}
}
