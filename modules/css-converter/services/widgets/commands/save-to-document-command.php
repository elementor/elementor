<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\Elementor_Document_Manager;

class Save_To_Document_Command implements Widget_Creation_Command_Interface {
	private Elementor_Document_Manager $document_manager;

	public function __construct( Elementor_Document_Manager $document_manager ) {
		$this->document_manager = $document_manager;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			$document = $context->get_document();
			if ( ! $document ) {
				return Widget_Creation_Result::failure( 'No document available in context' );
			}

			$elementor_elements = $context->get_elementor_elements();
			$this->document_manager->save_to_document( $document, $elementor_elements );

			return Widget_Creation_Result::success( [
				'elements_saved' => count( $elementor_elements ),
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	public function get_command_name(): string {
		return 'save_to_document';
	}
}
