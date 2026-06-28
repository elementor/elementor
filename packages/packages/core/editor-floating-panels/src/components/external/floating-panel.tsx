import * as React from 'react';

type Props = {
	children: React.ReactNode;
};

export default function FloatingPanel( { children }: Props ) {
	return <>{ children }</>;
}
