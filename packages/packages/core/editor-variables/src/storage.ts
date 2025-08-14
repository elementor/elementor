import { type Variable, type VariablesList } from './types';

const STORAGE_KEY = 'elementor-global-variables';
const STORAGE_WATERMARK_KEY = 'elementor-global-variables-watermark';

export const OP_RW = 'RW';
const OP_RO = 'RO';

export class Storage {
	state: {
		watermark: number;
		variables: VariablesList;
	};

	constructor() {
		this.state = {
			watermark: -1,
			variables: {},
		};
	}

	load() {
		this.state.watermark = parseInt( localStorage.getItem( STORAGE_WATERMARK_KEY ) || '-1' );
		this.state.variables = JSON.parse( localStorage.getItem( STORAGE_KEY ) || '{}' ) as VariablesList;
		return this.state.variables;
	}

	fill( variables: VariablesList, watermark: number ) {
		this.state.variables = {};
		if ( variables && Object.keys( variables ).length ) {
			this.state.variables = variables;
		}

		this.state.watermark = watermark;

		localStorage.setItem( STORAGE_WATERMARK_KEY, this.state.watermark.toString() );
		localStorage.setItem( STORAGE_KEY, JSON.stringify( this.state.variables ) );
	}

	add( id: string, variable: Variable ) {
		this.load();
		this.state.variables[ id ] = variable;
		localStorage.setItem( STORAGE_KEY, JSON.stringify( this.state.variables ) );
	}

	update( id: string, variable: Variable ) {
		this.load();
		this.state.variables[ id ] = variable;
		localStorage.setItem( STORAGE_KEY, JSON.stringify( this.state.variables ) );
	}

	watermark( watermark: number ) {
		this.state.watermark = watermark;
		localStorage.setItem( STORAGE_WATERMARK_KEY, this.state.watermark.toString() );
	}

	watermarkDiff( operation: string, newWatermark: number ) {
		const diff = newWatermark - this.state.watermark;

		if ( OP_RW === operation ) {
			return 1 !== diff;
		}

		if ( OP_RO === operation ) {
			return 0 !== diff;
		}

		return false;
	}
}
