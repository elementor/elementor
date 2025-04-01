import LinkInLinkRestrictionBase from '../base/link-in-link-restriction-base';

export class LinkInLinkPaste extends LinkInLinkRestrictionBase {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'link-in-link-restriction-paste';
	}
}

export default LinkInLinkPaste;
