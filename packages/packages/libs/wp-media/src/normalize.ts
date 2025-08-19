import { type Attachment } from './types/attachment';
import { type WpAttachmentJSON } from './types/wp-media';

export default function normalize( attachment: WpAttachmentJSON ): Attachment {
	const { filesizeInBytes, filesizeHumanReadable, author, authorName, ...rest } = attachment;

	return {
		...rest,
		filesize: {
			inBytes: filesizeInBytes,
			humanReadable: filesizeHumanReadable,
		},
		author: {
			id: parseInt( author ),
			name: authorName,
		},
	};
}
