jQuery(document).ready(function ($) {
    const $wrap = $('.wrap');

    // Create header container
    const $header = $('<div>', { class: 'e-admin-header' });

    // Find elements to move
    const $title = $wrap.find('h1.wp-heading-inline');
    const $actions = $wrap.find('.page-title-action');
    const $hr = $wrap.find('hr.wp-header-end');

    // Move elements to header
    if ($title.length) {
        $header.append($title);
    }

    if ($actions.length) {
        // Wrap actions in a container if there are multiple
        const $actionsContainer = $('<div>', { class: 'e-admin-actions' });
        $actions.each(function () {
            $actionsContainer.append($(this));
        });
        $header.append($actionsContainer);
    }

    // Prepend header to wrap
    $wrap.prepend($header);

    // Remove the WP header end hr as it's no longer needed in the flow
    if ($hr.length) {
        $hr.remove();
    }
});
