import LinkInLinkRestrictionBase from '../base/link-in-link-restriction-base';

export class LinkInLinkMove extends LinkInLinkRestrictionBase {
	getCommand() {
		return 'document/elements/move';
	}

	getId() {
		return 'link-in-link-restriction-move';
	}
}

export default LinkInLinkMove;
