import { HistoryPanel } from '@editor/history';
import { useDocumentHistory } from './useDocumentHistory';

export const History = () => {
    const { items, currentItem, applyItem } = useDocumentHistory();

    return (
	<HistoryPanel
		items={ items }
		currentItem={ currentItem }
		applyItem={ applyItem }
        />
    );
};
