// TODO: Types are broken in the browser version, we will fix it later.
declare module 'twing/dist/lib.min' {
	import { createArrayLoader as createArrayLoaderBase, createEnvironment as createEnvironmentBase } from 'twing';

	export const createArrayLoader: typeof createArrayLoaderBase;
	export const createEnvironment: typeof createEnvironmentBase;
}
