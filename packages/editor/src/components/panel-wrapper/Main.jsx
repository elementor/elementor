import {useEffect, useRef} from "react";

export const Main = (props) => {
	const ref = useRef();
	const scrollbar = useRef(false);

	useEffect(() => {
		if (!scrollbar.current) {
			// eslint-disable-next-line no-undef
			scrollbar.current = new PerfectScrollbar(ref.current, {
				suppressScrollX: true,
				// The RTL is buggy, so always keep it LTR.
				isRtl: false,
			});
			return;
		}

		scrollbar.current.update();
	}, [ref])

	return (
		<main id="elementor-panel-content-wrapper" ref={ref}>
			{props.children}
		</main>
	);
}
