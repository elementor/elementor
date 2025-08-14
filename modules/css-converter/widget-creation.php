<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Plugin;
use Exception;

function elementor_css_converter_create_widgets( $elements, $post_id, $post_type, $parent_container_id ) {
	// Ensure Elementor is loaded
	if ( ! class_exists( 'Elementor\\Plugin' ) ) {
		return [
			'error' => 'Elementor is not active',
		];
	}

	// Create post if needed
	if ( ! $post_id ) {
		// SECURITY NOTE: Creating posts programmatically should validate user caps.
		$post_id = wp_insert_post( [
			'post_title' => 'Elementor CSS Converter',
			'post_type' => $post_type,
			'post_status' => 'draft',
		] );
		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return [
				'error' => 'Failed to create post',
				'details' => is_wp_error( $post_id ) ? $post_id->get_error_message() : null,
			];
		}
	}

	// Get Elementor document
	$document = Plugin::$instance->documents->get( $post_id );
	if ( ! $document ) {
		return [
			'error' => 'Failed to get Elementor document for post',
			'postId' => $post_id,
		];
	}

	// Save elements to document
	try {
		$document->save( 
			[
				'elements' => $elements,
			]
		);
	} catch ( Exception $e ) {
		return [
			'error' => 'Failed to save elements to document',
			'details' => $e->getMessage(),
			'postId' => $post_id,
		];
	}

	$edit_url = method_exists( $document, 'get_edit_url' ) ? $document->get_edit_url() : get_edit_post_link( $post_id, '' );
	return [
		'created' => true,
		'elements' => $elements,
		'postId' => $post_id,
		'postType' => $post_type,
		'parentContainerId' => $parent_container_id,
		'editUrl' => $edit_url,
	];
}
