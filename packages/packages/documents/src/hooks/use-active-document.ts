import { useSelector } from '@elementor/store';
import { selectActiveDocument } from '../store/selectors';

export default function useActiveDocument() {
	return useSelector( selectActiveDocument );
}
