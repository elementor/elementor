import { Document } from '../types';
import { useSelector } from '@elementor/store';
import { currentDocument } from '../store/selectors';

export default function useActiveDocument(): Document | null {
	return useSelector( currentDocument );
}
