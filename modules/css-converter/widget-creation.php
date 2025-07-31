<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Plugin;
use Exception;

function elementor_css_converter_create_widgets($elements, $postId, $postType, $parentContainerId) {
    // Ensure Elementor is loaded
    if (!class_exists('Elementor\\Plugin')) {
        return [
            'error' => 'Elementor is not active',
        ];
    }

    // Create post if needed
    if (!$postId) {
        $postId = wp_insert_post([
            'post_title' => 'Elementor CSS Converter',
            'post_type' => $postType,
            'post_status' => 'draft',
        ]);
        if (is_wp_error($postId) || !$postId) {
            return [
                'error' => 'Failed to create post',
                'details' => is_wp_error($postId) ? $postId->get_error_message() : null,
            ];
        }
    }

    // Get Elementor document
    $document = Plugin::$instance->documents->get($postId);
    if (!$document) {
        return [
            'error' => 'Failed to get Elementor document for post',
            'postId' => $postId,
        ];
    }

    // Save elements to document
    try {
        $document->save([
            'elements' => $elements,
        ]);
    } catch (Exception $e) {
        return [
            'error' => 'Failed to save elements to document',
            'details' => $e->getMessage(),
            'postId' => $postId,
        ];
    }

    $editUrl = method_exists($document, 'get_edit_url') ? $document->get_edit_url() : get_edit_post_link($postId, '');
    return [
        'created' => true,
        'elements' => $elements,
        'postId' => $postId,
        'postType' => $postType,
        'parentContainerId' => $parentContainerId,
        'editUrl' => $editUrl,
    ];
} 