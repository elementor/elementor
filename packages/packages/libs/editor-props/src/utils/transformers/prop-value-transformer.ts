import { type PropValue, type TransformablePropValue } from '../../types';

export type PropValueTransformer = < T = PropValue | TransformablePropValue< string > >( value: T ) => T;
