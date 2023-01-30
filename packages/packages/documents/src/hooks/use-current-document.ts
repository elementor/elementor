import { Document } from '../types';
import { useSelector } from '@elementor/store';
import { currentDocument } from '../store/selectors';

export default function useCurrentDocument(): Document | null {
	return useSelector( currentDocument );
}
