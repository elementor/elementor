import { useImportContext } from '../../import/context/import-context';
import { useExportContext } from '../../export/context/export-context';

export default function useContextDetection() {
	let isImport = false;
	let contextData = null;

	try {
		contextData = useImportContext();
		isImport = true;
	} catch {
		try {
			contextData = useExportContext();
			isImport = false;
		} catch {
			return { isImport: null, contextData: null };
		}
	}

	return { isImport, contextData };
}
