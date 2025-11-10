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
			
			// CRITICAL FIX: Wrap widgets in proper container hierarchy for Elementor
			// Elementor requires widgets to be inside containers, not at top-level
			$wrapped_elements = $this->wrap_widgets_in_container( $elementor_elements );
			
			$this->document_manager->save_to_document( $document, $wrapped_elements );

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

	private function wrap_widgets_in_container( array $elements ): array {
		if ( empty( $elements ) ) {
			return $elements;
		}

		$container_id = wp_generate_uuid4();
		
		$container = [
			'id' => $container_id,
			'elType' => 'e-div-block',
			'settings' => [
				'tag' => [
					'$$type' => 'string',
					'value' => 'section'
				],
				'classes' => [
					'$$type' => 'classes',
					'value' => [ 'css-converter-container' ]
				]
			],
			'isInner' => false,
			'styles' => [],
			'editor_settings' => [
				'css_converter_widget' => true
			],
			'version' => '0.0',
			'elements' => $elements
		];

		return [ $container ];
	}
}
