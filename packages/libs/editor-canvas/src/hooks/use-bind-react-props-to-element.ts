import { useEffect } from 'react';

type Props = Record< string, unknown >;

export function useBindReactPropsToElement( element: HTMLElement, getProps: () => Props ) {
	useEffect( () => {
		const el = element;

		const { events, attrs } = groupProps( getProps() );

		events.forEach( ( [ eventName, listener ] ) => el.addEventListener( eventName, listener ) );
		attrs.forEach( ( [ attrName, attrValue ] ) => el.setAttribute( attrName, attrValue ) );

		return () => {
			events.forEach( ( [ eventName, listener ] ) => el.removeEventListener( eventName, listener ) );
			attrs.forEach( ( [ attrName ] ) => el.removeAttribute( attrName ) );
		};
	}, [ getProps, element ] );
}

type GroupedProps = {
	events: Array< [ string, () => void ] >;
	attrs: Array< [ string, string ] >;
};

function groupProps( props: Props ) {
	const eventRegex = /^on(?=[A-Z])/;

	return Object.entries( props ).reduce< GroupedProps >(
		( acc, [ propName, propValue ] ) => {
			if ( ! eventRegex.test( propName ) ) {
				acc.attrs.push( [ propName, propValue as string ] );

				return acc;
			}

			const eventName = propName.replace( eventRegex, '' ).toLowerCase();
			const listener = propValue as () => void;

			acc.events.push( [ eventName, listener ] );

			return acc;
		},
		{
			events: [],
			attrs: [],
		}
	);
}
