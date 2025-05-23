import { useSelector } from '@elementor/store';
import { selectActiveBreakpoint, selectSortedBreakpoints } from '../store/selectors';

export default function useBreakpoints() {
	const all = useSelector( selectSortedBreakpoints );
	const active = useSelector( selectActiveBreakpoint );

	return {
		all,
		active,
	};
}
