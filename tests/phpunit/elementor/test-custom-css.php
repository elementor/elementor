<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Document_Types extends Elementor_Test_Base {

	/**
	 * @todo section should have "custom_css_pro"
	 */
	public function test_getInstance() {
		$document_types = $this->elementor()->documents->get_document_types();
		$missing_custom_css = [];
<<<<<<< HEAD
		$exclude = [ 'container', 'section', 'not-supported', 'test-document', 'cloud-template-preview', 'e-div-block', 'e-flexbox', 'elementor_component' ];
=======
		$exclude = [ 'container', 'section', 'not-supported', 'test-document', 'cloud-template-preview', 'e-div-block', 'e-flexbox', 'e-grid', 'e-form', 'elementor_component' ];
>>>>>>> 3e4f4a971e (Fix: [V4] Can't save atomic form as template [ED-23917])
		foreach ( $document_types as $type => $class_name ) {
			$document = $this->elementor()->documents->create( $type );
			// TODO                                           remove this ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ when section will have "custom_css_pro"
			if ( ! isset( $document->get_controls()['custom_css_pro'] ) && ! in_array( $type, $exclude ) ) {
				array_push( $missing_custom_css, $type );
			}
		}
		$missing_custom_css = implode( ' | ', $missing_custom_css );
		$this->assertEmpty( $missing_custom_css, "in the documents [ $missing_custom_css ] custom_css_pro is missing" );
	}
}
