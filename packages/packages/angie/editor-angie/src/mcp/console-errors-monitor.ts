export type ConsoleError = {
	timestamp: number;
	level: 'error';
	message: string;
	stack?: string;
};

export type ConsoleErrorsFilters = {
	since?: number;
	limit?: number;
};

const MAX_STORED_ERRORS = 100;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const HTTP_ERROR_STATUS = 400;
const FAILED_RESOURCE_INITIATORS = [ 'script', 'link', 'img' ];

const getResourceUrl = ( element: HTMLElement ): string => {
	if ( 'src' in element && typeof element.src === 'string' ) {
		return element.src;
	}

	if ( 'href' in element && typeof element.href === 'string' ) {
		return element.href;
	}

	return '';
};

class ConsoleErrorsMonitor {
	private errors: ConsoleError[] = [];
	private failedResourcesCollected = false;

	constructor() {
		window.addEventListener( 'error', ( event ) => this.onError( event ), { capture: true } );
		window.addEventListener( 'unhandledrejection', ( event ) => this.onUnhandledRejection( event ) );
	}

	get( { since, limit = DEFAULT_LIMIT }: ConsoleErrorsFilters = {} ): ConsoleError[] {
		this.collectFailedResources();

		const errors = since ? this.errors.filter( ( error ) => error.timestamp > since ) : this.errors;
		const count = Math.min( Math.max( limit, 0 ), MAX_LIMIT );

		// `slice( -0 )` returns the whole buffer, so a zero or negative limit must return nothing explicitly.
		return count > 0 ? errors.slice( -count ) : [];
	}

	private onError( event: ErrorEvent ) {
		const isResourceError = event.target !== window && event.target instanceof HTMLElement;

		if ( ! isResourceError ) {
			this.add( event.message, event.error?.stack );

			return;
		}

		const url = getResourceUrl( event.target );

		if ( url ) {
			this.add( `Resource load error: ${ url }` );
		}
	}

	private onUnhandledRejection( event: PromiseRejectionEvent ) {
		const { reason } = event;
		const message = reason instanceof Error ? reason.message : String( reason );

		this.add( `Unhandled Promise Rejection: ${ message }`, reason instanceof Error ? reason.stack : undefined );
	}

	private collectFailedResources() {
		if ( this.failedResourcesCollected ) {
			return;
		}

		this.failedResourcesCollected = true;

		const entries = performance.getEntriesByType( 'resource' ) as PerformanceResourceTiming[];

		entries
			.filter(
				( entry ) =>
					entry.responseStatus >= HTTP_ERROR_STATUS &&
					FAILED_RESOURCE_INITIATORS.includes( entry.initiatorType )
			)
			// Stamp with the time the load failed, not now, so a `since` filter does not report old failures as new.
			.forEach( ( entry ) =>
				this.add(
					`Resource load error: ${ entry.name }`,
					undefined,
					performance.timeOrigin + ( entry.responseEnd || entry.startTime )
				)
			);

		// Backfilled failures can be older than errors already captured; keep the buffer oldest-first for `limit`.
		this.errors.sort( ( a, b ) => a.timestamp - b.timestamp );
	}

	private add( message: string, stack?: string, timestamp = Date.now() ) {
		this.errors.push( { timestamp, level: 'error', message, stack } );

		if ( this.errors.length > MAX_STORED_ERRORS ) {
			this.errors.shift();
		}
	}
}

let monitor: ConsoleErrorsMonitor | null = null;

export const startConsoleErrorsMonitor = (): void => {
	monitor ??= new ConsoleErrorsMonitor();
};

export const getConsoleErrors = ( filters?: ConsoleErrorsFilters ): ConsoleError[] => {
	if ( ! monitor ) {
		throw new Error( 'Console errors monitor not initialized' );
	}

	return monitor.get( filters );
};

export const resetConsoleErrorsMonitorForTests = (): void => {
	monitor = null;
};
