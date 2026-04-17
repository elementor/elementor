<?php
/**
 * Plugin Name: Disable WP Pointers for Testing
 * Description: Prevents WordPress pointers and feature tours from loading to ensure a stable testing environment.
 */

add_action('admin_enqueue_scripts', function() {
    remove_action('admin_enqueue_scripts', array('WP_Internal_Pointers', 'enqueue_scripts'));
}, 1);
