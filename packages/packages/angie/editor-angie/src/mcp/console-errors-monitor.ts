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

		return errors.slice( -Math.min( limit, MAX_LIMIT ) );
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
			.forEach( ( entry ) => this.add( `Resource load error: ${ entry.name }` ) );
	}

	private add( message: string, stack?: string ) {
		this.errors.push( { timestamp: Date.now(), level: 'error', message, stack } );

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
