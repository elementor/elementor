import { Commands } from './commands';

export type jQueryDeferred<T> = {
	then<U>( onFulfill: ( value: T ) => U, onReject?: ( error: any ) => U ): jQueryDeferred<U>;
};

export type Promisify<T> = Promise<Awaited<T>>;

export type ExtendedWindow = Window & {
	$e: {
		run: <T extends keyof Commands>( command: T, args?: Commands[T]['args'] ) => Commands[T]['returnValue'],
	},
}
