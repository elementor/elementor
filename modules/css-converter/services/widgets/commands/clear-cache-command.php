<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Cache_Manager;

class Clear_Cache_Command implements Widget_Creation_Command_Interface {
	private Widget_Cache_Manager $cache_manager;

	public function __construct( Widget_Cache_Manager $cache_manager ) {
		$this->cache_manager = $cache_manager;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			$post_id = $context->get_post_id();
			if ( ! $post_id ) {
				return Widget_Creation_Result::failure( 'No post ID available for cache clearing' );
			}

			$this->cache_manager->clear_document_cache_for_css_converter_widgets( $post_id );

			return Widget_Creation_Result::success( [
				'cache_cleared_for_post' => $post_id,
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	public function get_command_name(): string {
		return 'clear_cache';
	}
}
