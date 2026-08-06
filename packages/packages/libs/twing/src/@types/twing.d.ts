// TODO: Types are broken in the browser version, we will fix it later.
declare module 'twing/dist/lib.min' {
  import {
    type createArrayLoader as createArrayLoaderBase,
    type createEnvironment as createEnvironmentBase,
  } from 'twing';

  export const createArrayLoader: typeof createArrayLoaderBase;
  export const createEnvironment: typeof createEnvironmentBase;
}
