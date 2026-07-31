<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Form_Structure_Validator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Form_Structure_Validator extends TestCase {

	private const DOCUMENT_ROOT = 'document';

	private Xml_Parser $xml_parser;
	private Form_Structure_Validator $validator;

	protected function setUp(): void {
		parent::setUp();

		$this->xml_parser = new Xml_Parser();
		$this->validator = new Form_Structure_Validator( $this->xml_parser );
	}

	public function test_collect_form_ancestor_errors__allows_direct_child_of_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-input /><e-form-submit-button /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_form_ancestor_errors__allows_deep_descendant_of_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-flexbox><e-form-input /></e-flexbox><e-form-submit-button /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_form_ancestor_errors__allows_form_wrapped_by_container() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-form><e-form-input /><e-form-submit-button /></e-form></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_form_ancestor_errors__rejects_orphaned_form_field() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-flexbox><e-form-input /></e-flexbox></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( 'e-form-input', $errors[0] );
		$this->assertStringContainsString( 'e-form', $errors[0] );
	}

	public function test_collect_form_ancestor_errors__reports_each_orphaned_field() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-form-input /><e-form-label /></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 2, $errors );
	}

	public function test_collect_form_ancestor_errors__includes_configuration_id_in_message() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-form-input configuration-id="my-input" /></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertStringContainsString( 'configuration-id="my-input"', $errors[0] );
	}

	public function test_collect_form_ancestor_errors__ignores_non_form_fields() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-heading /></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_form_ancestor_errors__allows_orphan_field_when_parent_is_existing_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form-input configuration-id="field-1" />' );
		$document_tree = [
			[
				'id' => 'form-1',
				'elType' => 'e-form',
				'settings' => [],
				'elements' => [],
			],
		];

		// Act
		$errors = $this->validator->collect_errors( $dom, $document_tree, 'form-1' );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_form_ancestor_errors__allows_orphan_field_when_parent_is_inside_existing_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form-input configuration-id="field-1" />' );
		$document_tree = [
			[
				'id' => 'form-1',
				'elType' => 'e-form',
				'settings' => [],
				'elements' => [
					[
						'id' => 'flex-1',
						'elType' => 'e-flexbox',
						'settings' => [],
						'elements' => [],
					],
				],
			],
		];

		// Act
		$errors = $this->validator->collect_errors( $dom, $document_tree, 'flex-1' );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_nested_form_errors__rejects_form_inside_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form><e-form-submit-button /></e-form></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertContains( '<e-form> cannot be nested inside another <e-form>.', $errors );
	}

	public function test_collect_nested_form_errors__rejects_form_appended_into_existing_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /></e-form>' );
		$document_tree = [
			[
				'id' => 'form-1',
				'elType' => 'e-form',
				'settings' => [],
				'elements' => [],
			],
		];

		// Act
		$errors = $this->validator->collect_errors( $dom, $document_tree, 'form-1' );

		// Assert
		$this->assertContains( '<e-form> cannot be nested inside another <e-form>.', $errors );
	}

	public function test_collect_submit_button_errors__allows_single_submit_button() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-input /><e-form-submit-button /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_submit_button_errors__allows_nested_submit_button() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-flexbox><e-form-submit-button /></e-flexbox></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_submit_button_errors__rejects_missing_submit_button() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-input /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( 'e-form-submit-button', $errors[0] );
	}

	public function test_collect_submit_button_errors__rejects_multiple_submit_buttons() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-submit-button /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( '2', $errors[0] );
	}

	public function test_collect_submit_button_errors__reports_each_invalid_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-input /></e-form><e-form><e-form-input /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 2, $errors );
	}

	public function test_collect_submit_button_errors__ignores_non_form_compositions() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-heading /></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_empty_message_errors__allows_success_message_with_children() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-success-message><e-paragraph /></e-form-success-message></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_empty_message_errors__allows_error_message_with_children() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-error-message><e-paragraph /></e-form-error-message></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	public function test_collect_empty_message_errors__rejects_empty_success_message() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-success-message /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( 'e-form-success-message', $errors[0] );
		$this->assertStringContainsString( 'e-paragraph', $errors[0] );
	}

	public function test_collect_empty_message_errors__rejects_empty_error_message() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-error-message /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( 'e-form-error-message', $errors[0] );
	}

	public function test_collect_empty_message_errors__reports_both_empty_messages() {
		// Arrange
		$dom = $this->parse_xml( '<e-form><e-form-submit-button /><e-form-success-message /><e-form-error-message /></e-form>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 2, $errors );
	}

	public function test_collect_empty_message_errors__rejects_empty_message_outside_form() {
		// Arrange
		$dom = $this->parse_xml( '<e-flexbox><e-form-success-message /></e-flexbox>' );

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertCount( 1, $errors );
		$this->assertStringContainsString( 'e-form-success-message', $errors[0] );
	}

	public function test_collect_errors__allows_valid_form_with_all_rules() {
		// Arrange
		$dom = $this->parse_xml(
			'<e-form><e-flexbox><e-form-input /></e-flexbox><e-form-submit-button /><e-form-success-message><e-paragraph /></e-form-success-message></e-form>'
		);

		// Act
		$errors = $this->validator->collect_errors( $dom, [], self::DOCUMENT_ROOT );

		// Assert
		$this->assertSame( [], $errors );
	}

	private function parse_xml( string $xml_structure ): \DOMDocument {
		$result = $this->xml_parser->parse( $xml_structure );

		$this->assertInstanceOf( \DOMDocument::class, $result );

		return $result;
	}
}
