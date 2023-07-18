import { useSelector } from '@elementor/store';
import { selectHostDocument } from '../store/selectors';

export default function useHostDocument() {
	return useSelector( selectHostDocument );
}
