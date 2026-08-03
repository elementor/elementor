<?php

namespace Elementor\Testing\Modules\Mcp\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Widget_Type_Resolver extends TestCase {

	const PARENT_TAG = 'e-background-video';
	const REQUIRED_TAG = 'e-background-video-content';
	const OPTIONAL_TAG = 'e-background-video-controls';

	private Xml_Parser $parser;
	private Widget_Type_Resolver $resolver;

	public function setUp(): void {
		parent::setUp();

		$this->parser = new Xml_Parser();
		$this->resolver = new Widget_Type_Resolver( $this->parser );
	}

	private function widget_configs(): array {
		return [
			self::PARENT_TAG => [
				'elType' => self::PARENT_TAG,
				'widgetType' => null,
				'allowed_child_types' => [ self::REQUIRED_TAG, self::OPTIONAL_TAG ],
				'default_children' => [
					[
						'elType' => self::REQUIRED_TAG,
						'meta' => [ 'required' => true ],
					],
					[
						'elType' => self::OPTIONAL_TAG,
					],
				],
			],
			self::REQUIRED_TAG => [
				'elType' => self::REQUIRED_TAG,
				'widgetType' => null,
				'allowed_child_types' => [],
				'default_children' => [],
			],
			self::OPTIONAL_TAG => [
				'elType' => self::OPTIONAL_TAG,
				'widgetType' => null,
				'allowed_child_types' => [],
				'default_children' => [],
			],
		];
	}

	private function validate( string $xml, ?array $widget_configs = null ) {
		$dom = $this->parser->parse( $xml );

		return $this->resolver->validate_child_types( $dom, $widget_configs ?? $this->widget_configs() );
	}

	public function test_validate_child_types__passes_when_the_required_child_is_present() {
		// Arrange.
		$xml = '<' . self::PARENT_TAG . '><' . self::REQUIRED_TAG . ' /></' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_validate_child_types__fails_when_the_required_child_is_missing() {
		// Arrange.
		$xml = '<' . self::PARENT_TAG . '><' . self::OPTIONAL_TAG . ' /></' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_invalid_child_type', $result->get_error_code() );
		$this->assertStringContainsString(
			'"' . self::PARENT_TAG . '" requires a direct child "' . self::REQUIRED_TAG . '".',
			$result->get_error_message()
		);
	}

	public function test_validate_child_types__fails_when_the_parent_has_no_children_at_all() {
		// Arrange.
		$xml = '<' . self::PARENT_TAG . ' />';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertStringContainsString( 'requires a direct child', $result->get_error_message() );
	}

	public function test_validate_child_types__does_not_require_children_without_the_required_meta() {
		// Arrange: only `e-background-video-content` is flagged as required.
		$xml = '<' . self::PARENT_TAG . '><' . self::REQUIRED_TAG . ' /></' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_validate_child_types__only_counts_direct_children_as_required() {
		// Arrange: the required child exists, but nested one level too deep.
		$xml = '<' . self::PARENT_TAG . '>'
			. '<' . self::OPTIONAL_TAG . '><' . self::REQUIRED_TAG . ' /></' . self::OPTIONAL_TAG . '>'
			. '</' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertStringContainsString( 'requires a direct child', $result->get_error_message() );
	}

	public function test_validate_child_types__resolves_required_widgets_by_widget_type() {
		// Arrange: widgets are keyed by `widgetType` rather than `elType`.
		$widget_configs = [
			'e-parent' => [
				'elType' => 'e-parent',
				'widgetType' => null,
				'allowed_child_types' => [ 'e-required-widget' ],
				'default_children' => [
					[
						'elType' => 'widget',
						'widgetType' => 'e-required-widget',
						'meta' => [ 'required' => true ],
					],
				],
			],
			'e-required-widget' => [
				'elType' => 'widget',
				'widgetType' => 'e-required-widget',
				'allowed_child_types' => [],
				'default_children' => [],
			],
		];

		// Act.
		$missing = $this->validate( '<e-parent />', $widget_configs );
		$present = $this->validate( '<e-parent><e-required-widget /></e-parent>', $widget_configs );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $missing );
		$this->assertStringContainsString( '"e-parent" requires a direct child "e-required-widget".', $missing->get_error_message() );
		$this->assertNull( $present );
	}

	public function test_validate_child_types__validates_required_children_recursively() {
		// Arrange: the nested parent is missing its own required child.
		$widget_configs = $this->widget_configs();
		$widget_configs[ self::OPTIONAL_TAG ]['allowed_child_types'] = [ self::PARENT_TAG ];
		$widget_configs[ self::PARENT_TAG ]['allowed_child_types'][] = self::PARENT_TAG;

		$xml = '<' . self::PARENT_TAG . '>'
			. '<' . self::REQUIRED_TAG . ' />'
			. '<' . self::OPTIONAL_TAG . '><' . self::PARENT_TAG . ' /></' . self::OPTIONAL_TAG . '>'
			. '</' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml, $widget_configs );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertStringContainsString( 'requires a direct child', $result->get_error_message() );
	}

	public function test_validate_child_types__ignores_unknown_tags() {
		// Act.
		$result = $this->validate( '<e-unknown-tag><e-another-unknown /></e-unknown-tag>' );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_validate_child_types__reports_disallowed_and_missing_required_children_together() {
		// Arrange.
		$xml = '<' . self::PARENT_TAG . '><e-not-allowed /></' . self::PARENT_TAG . '>';

		// Act.
		$result = $this->validate( $xml );

		// Assert.
		$message = $result->get_error_message();
		$this->assertStringContainsString( 'is not allowed as a child of', $message );
		$this->assertStringContainsString( 'requires a direct child', $message );
	}
}
