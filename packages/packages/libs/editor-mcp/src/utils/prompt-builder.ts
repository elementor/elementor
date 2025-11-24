class ToolPrompts {
	public _description = '';
	public _parameters: Record< string, string > = {};
	public _examples: string[] = [];
	public _furtherInstructions: string[] = [];

	constructor( public name: string ) {}

	description(): string;
	description( desc: string ): this;
	description( desc?: string | undefined ) {
		if ( typeof desc === 'undefined' ) {
			return this._description;
		}
		this._description = desc;
		return this;
	}

	parameter( key: string ): string;
	parameter( key: string, description: string ): this;
	parameter( key: string, description?: string ) {
		if ( typeof description === 'undefined' ) {
			return this._parameters[ key ];
		}
		this._parameters[ key ] = `**${ key }**:\n${ description }`;
		return this;
	}

	instruction( instruction: string ): this {
		this._furtherInstructions.push( instruction );
		return this;
	}

	example( example: string ): this {
		this._examples.push( example );
		return this;
	}

	public get examples() {
		return this._examples.join( '\n\n' );
	}

	prompt(): string {
		return `# ${ this.name }
# Description
${ this._description }

${ this._parameters.length ? '# Parameters' : '' }
${ Object.values( this._parameters ).join( '\n\n' ) }

${ this._examples.length ? '# Examples' : '' }
${ this.examples }

${ this._furtherInstructions.length ? '# Further Instructions' : '' }
${ this._furtherInstructions.join( '\n\n' ) }
`.trim();
	}
}

export const toolPrompts = ( name: string ) => {
	return new ToolPrompts( name );
};
