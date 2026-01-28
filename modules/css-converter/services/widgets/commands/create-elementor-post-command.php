<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\Elementor_Document_Manager;

class Create_Elementor_Post_Command implements Widget_Creation_Command_Interface {
	private Elementor_Document_Manager $document_manager;

	public function __construct( Elementor_Document_Manager $document_manager ) {
		$this->document_manager = $document_manager;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			$post_id = $this->document_manager->ensure_post_exists(
				$context->get_post_id(),
				$context->get_post_type()
			);

			$context->set_post_id( $post_id );

			$document = $this->document_manager->get_elementor_document( $post_id );
			$context->set_document( $document );

			return Widget_Creation_Result::success( [
				'post_id' => $post_id,
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	public function get_command_name(): string {
		return 'create_elementor_post';
	}
}
