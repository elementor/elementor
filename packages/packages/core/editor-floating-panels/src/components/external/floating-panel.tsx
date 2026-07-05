import { type ReactNode } from 'react';

type Props = {
	children: ReactNode;
};

export default function FloatingPanel( { children }: Props ) {
	return <>{ children }</>;
}
