type Link< T > = {
	prev: Link< T > | null;
	next: Link< T > | null;
	value: T;
};

function createLink< T >( { value, next, prev }: { value: T; prev?: Link< T >; next?: Link< T > } ): Link< T > {
	return {
		value,
		prev: prev || null,
		next: next || null,
	};
}

export class SnapshotHistory< T > {
	private static registry: Record< string, SnapshotHistory< unknown > > = {};

	public static get< K >( namespace: string ): SnapshotHistory< K > {
		if ( ! SnapshotHistory.registry[ namespace ] ) {
			SnapshotHistory.registry[ namespace ] = new SnapshotHistory( namespace );
		}
		return SnapshotHistory.registry[ namespace ] as SnapshotHistory< K >;
	}

	private first: Link< T > | null = null;
	private current: Link< T > | null = null;

	private constructor( public readonly namespace: string ) {}

	private transform( item: T ): T {
		return JSON.parse( JSON.stringify( item ) );
	}

	public reset(): void {
		this.first = this.current = null;
	}

	public prev(): T | null {
		if ( ! this.current || this.current === this.first ) {
			return null;
		}
		this.current = this.current.prev;
		return this.current?.value || null;
	}

	public isLast(): boolean {
		return ! this.current || ! this.current.next;
	}

	public next( value?: T ): T | null {
		if ( value ) {
			if ( ! this.current ) {
				this.first = createLink( { value: this.transform( value ) } );
				this.current = this.first;
				return this.current.value;
			}
			const nextLink = createLink( {
				value: this.transform( value ),
				prev: this.current,
			} );
			this.current.next = nextLink;
			this.current = nextLink;
			return this.current.value;
		}

		// No value skip to next without setting any
		if ( ! this.current || ! this.current.next ) {
			return null;
		}
		this.current = this.current.next;
		return this.current.value;
	}
}
