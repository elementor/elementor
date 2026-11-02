<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Forms_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Pro_Elements_Remover;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Features_Discovery;
use Elementor\Utils;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Pro_Elements_Remover extends TestCase {

	private Xml_Parser $xml_parser;
	private Pro_Elements_Remover $remover;

	protected function setUp(): void {
		parent::setUp();

		if ( Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro to be inactive.' );
		}

		$this->xml_parser = new Xml_Parser();
		$this->remover = new Pro_Elements_Remover( $this->xml_parser );
	}

	public function test_remove_and_collect_errors__removes_pro_elements_and_keeps_free_ones() {
		// Arrange
		$dom = $this->parse_xml( '<e-div-block><e-heading /><e-form><e-form-input /></e-form></e-div-block>' );

		// Act
		$errors = $this->remover->remove_and_collect_errors( $dom );

		// Assert
		$xml = $dom->saveXML();
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( '<e-heading', $xml );
		$this->assertStringNotContainsString( 'e-form', $xml );
	}

	public function test_remove_and_collect_errors__returns_a_single_error_for_a_form_and_its_fields() {
		// Arrange
		$dom = $this->parse_xml( '<e-div-block><e-form><e-form-input /><e-form-submit-button /></e-form><e-form-input /></e-div-block>' );

		// Act
		$errors = $this->remover->remove_and_collect_errors( $dom );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertSame( Forms_Pro_Features_Discovery::for_widget()->get_error_message(), $errors[0]->get_error_message() );
	}

	public function test_remove_and_collect_errors__treats_form_messages_outside_a_form_as_pro_elements() {
		// Arrange
		$dom = $this->parse_xml( '<e-div-block><e-form-success-message /><e-form-error-message /></e-div-block>' );

		// Act
		$errors = $this->remover->remove_and_collect_errors( $dom );

		// Assert
		$xml = $dom->saveXML();
		$this->assertCount( 1, $errors );
		$this->assertStringNotContainsString( 'e-form-success-message', $xml );
		$this->assertStringNotContainsString( 'e-form-error-message', $xml );
	}

	public function test_remove_and_collect_errors__returns_an_error_per_distinct_pro_feature_in_document_order() {
		// Arrange
		$dom = $this->parse_xml( '<e-div-block><theme-post-title /><e-form /></e-div-block>' );

		// Act
		$errors = $this->remover->remove_and_collect_errors( $dom );

		// Assert
		$this->assertSame(
			[
				Site_Parts_Pro_Features_Discovery::for_widget()->get_error_message(),
				Forms_Pro_Features_Discovery::for_widget()->get_error_message(),
			],
			array_map( fn( \WP_Error $error ) => $error->get_error_message(), $errors )
		);
	}

	public function test_remove_and_collect_errors__leaves_the_document_untouched_without_pro_elements() {
		// Arrange
		$dom = $this->parse_xml( '<e-div-block><e-heading /></e-div-block>' );
		$xml_before = $dom->saveXML();

		// Act
		$errors = $this->remover->remove_and_collect_errors( $dom );

		// Assert
		$this->assertSame( [], $errors );
		$this->assertSame( $xml_before, $dom->saveXML() );
	}

	private function parse_xml( string $xml ): \DOMDocument {
		$dom = $this->xml_parser->parse( $xml );
		$this->assertInstanceOf( \DOMDocument::class, $dom );

		return $dom;
	}
}
