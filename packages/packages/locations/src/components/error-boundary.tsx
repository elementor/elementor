import { Component, ReactNode } from 'react';

interface Props {
	children?: ReactNode;
	fallback: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(): State {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	public render() {
		if ( this.state.hasError ) {
			return this.props.fallback;
		}

		return this.props.children;
	}
}
