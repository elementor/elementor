import { Document } from '../types';
import { useSelector } from '@elementor/store';
import { selectActiveDocument } from '../store/selectors';

export default function useActiveDocument(): Document | null {
	return useSelector( selectActiveDocument );
}
