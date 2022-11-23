import React, {useEffect, useRef} from "react";

type Props = {
	children: React.ReactNode,
}

type Scrollbar = {
	current: {
		update: any,
	}
}

const PerfectScrollbar = class {
	current:any;

	constructor( el:HTMLElement, options: any ) {
	}

	update() {

	}
}

export const Main: React.VFC<Props> = (props) => {
	const ref = useRef();
	const scrollbar = useRef<Scrollbar|Boolean>(false);

	useEffect(() => {
		if (!scrollbar.current) {
			// eslint-disable-next-line no-undef
			// @ts-ignore
			scrollbar.current = new PerfectScrollbar( ref.current, {
				suppressScrollX: true,
				// The RTL is buggy, so always keep it LTR.
				isRtl: false,
			});
			return;
		}
		// @ts-ignore
		scrollbar.current.update();
	}, [ref])

	return (
		// @ts-ignore
		<main id="elementor-panel-content-wrapper" ref={ref}>
			{props.children}
		</main>
	);
}
