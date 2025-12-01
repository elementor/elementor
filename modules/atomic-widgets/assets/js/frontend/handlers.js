import { register } from '@elementor/frontend-handlers';

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_WITHIN = [
    'e-divider',
    'e-heading',
    'e-image',
    'e-paragraph',
    'e-svg',
];

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_OUTSIDE = [
    'e-div-block',
    'e-flexbox',
];

const ATOMIC_ELEMENT_TYPES_WITH_LINKS_AS_THEM = [
    'e-button',
];

registerLinkActionsHandler();

function registerLinkActionsHandler() {
    ATOMIC_ELEMENT_TYPES_WITH_LINKS_WITHIN.forEach((elementType) => register({
        elementType,
        id: `${elementType}-link-action-handler`,
        callback: ({ element }) => {
            const actionLinks = Array.from(element?.children || [])
                .filter((child) => child.dataset && child.dataset.href);

            if (!actionLinks?.length) {
                return;
            }

            const cleanupFunctions = actionLinks.map(handleLinkActions);

            return () => cleanupFunctions.forEach((cleanup) => cleanup?.());
        }
    }));
}

function handleLinkActions(element) {
    const url = element.dataset.href;

    if (!url) {
        return;
    }

    const handler = (event) => {
        event.preventDefault();

        if (!window.elementorFrontend?.utils?.urlActions) {
            return;
        }

        elementorFrontend.utils.urlActions.runAction(url, event);
    };

    element.addEventListener('click', handler);

    return () => element.removeEventListener('click', handler);
}
