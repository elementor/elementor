import * as React from 'react';
import { type FormEvent as RectFormEven, type KeyboardEvent, type PropsWithChildren, useRef } from 'react';

type Props = PropsWithChildren< {
	onSubmit?: () => void;
} >;
export const Form = ( { children, onSubmit }: Props ) => {
	const formRef = useRef< HTMLFormElement >( null );

	const handleSubmit = ( e: RectFormEven< HTMLFormElement > | SubmitEvent ) => {
		e.preventDefault();
		onSubmit?.();

		return false;
	};

	const handleKeyDown = ( e: KeyboardEvent< HTMLFormElement > ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();

			formRef.current?.requestSubmit();
		}
	};

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<form action="#" onSubmit={ handleSubmit } ref={ formRef } onKeyDown={ handleKeyDown }>
			{ children }
		</form>
	);
};
