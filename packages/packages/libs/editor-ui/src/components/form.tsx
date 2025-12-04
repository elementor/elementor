import * as React from 'react';
import { type FormEvent as FormEvent, type KeyboardEvent, type PropsWithChildren, useRef } from 'react';

type Props = PropsWithChildren< {
	onSubmit?: () => void;
} >;
export const Form = ( { children, onSubmit }: Props ) => {
	const formRef = useRef< HTMLFormElement >( null );

	const handleSubmit = ( e: FormEvent< HTMLFormElement > | SubmitEvent ) => {
		e.preventDefault();
		onSubmit?.();
	};

	const handleKeyDown = ( e: KeyboardEvent< HTMLFormElement > ) => {
		const { target } = e;
		if ( e.key === 'Enter' && target instanceof HTMLInputElement && target.type !== 'submit' ) {
			e.preventDefault();

			formRef.current?.requestSubmit();
		}
	};

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<form onSubmit={ handleSubmit } ref={ formRef } onKeyDown={ handleKeyDown }>
			{ children }
		</form>
	);
};
