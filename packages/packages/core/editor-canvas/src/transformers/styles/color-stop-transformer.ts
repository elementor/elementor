import { createTransformer } from '../create-transformer';

type ColorStop = {
	color?: string;
	offset?: number;
};

export const colorStopTransformer = createTransformer(
	( value: ColorStop ) => `${ value?.color } ${ value?.offset ?? 0 }%`
);
