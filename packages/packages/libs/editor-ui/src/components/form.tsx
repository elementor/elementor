import * as React from 'react';
import { type FormEvent as RectFormEven, type KeyboardEvent, type PropsWithChildren, useRef } from 'react';

type Props = PropsWithChildren<{
	onSubmit?: () => void;
}>;
export const Form = ( {children, onSubmit}: Props ) => {
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = ( e: RectFormEven<HTMLFormElement> | SubmitEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		onSubmit?.();

		return false;
	}
	
	const handleKeyDown = ( e: KeyboardEvent<HTMLFormElement> ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();

			formRef.current?.requestSubmit();
		}
	}
	
	return (
		<form action="#" onSubmit={handleSubmit} ref={formRef} onKeyDown={handleKeyDown}>
			{ children }
		</form>
	);
}
