export class RenderContext< TContext extends Record< string, unknown > > {
	private key: string;
	private context = new Map< string, TContext >();

	public constructor( key: string, initialContext: TContext ) {
		this.key = key;
		this.context.set( this.key, initialContext );
	}

	public get(): TContext {
		return this.context.get( this.key ) as TContext;
	}

	public set( context: TContext ) {
		this.context.set( this.key, context );
	}

	public update( updates: TContext ) {
		const currentContext = this.context.get( this.key );

		if ( ! currentContext ) {
			return this.set( updates );
		}

		this.context.set( this.key, { ...currentContext, ...updates } );
	}

	public delete() {
		this.context.delete( this.key );
	}

	public clear() {
		this.context.clear();
	}
}
