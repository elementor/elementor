<?php

namespace Elementor\Tests\Modules\GlobalClasses\Usage;

use Elementor\Core\Base\Document;
use Elementor\Modules\GlobalClasses\Usage\Document_Usage;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase;

class Document_Usage_Test extends TestCase {
	private $document;
	private $document_usage;

	public function setUp(): void {
		parent::setUp();

		// Create a mock Document
		$this->document = new class extends Document {
			public function __construct() {}

			public function get_elements_raw_data() {
				return [
					[
						'id' => 'test_element',
						'elType' => 'widget',
						'settings' => [
							'classes' => [
								'value' => ['global-class-1', 'global-class-2']
							]
						]
					]
				];
			}

			public function get_main_id() {
				return 1;
			}

			public function get_type() {
				return 'page';
			}

			public static function get_properties() {
				return [];
			}

			public function get_name() {
				return 'document';
			}

			public function get_unique_name() {
				return 'document';
			}
		};

		// Mock Plugin instance
		Plugin::$instance = $this->getMockBuilder(Plugin::class)
		                         ->disableOriginalConstructor()
		                         ->getMock();

		// Mock database iterate_data method
		Plugin::$instance->db = new class {
			public function iterate_data($data, $callback) {
				foreach ($data as $element_data) {
					$callback($element_data);
				}
			}
		};

		// Create Document_Usage instance
		$this->document_usage = new Document_Usage($this->document);
	}

	public function testAnalyzeWithGlobalClasses(): void {
		// Mock functions
		if (!function_exists('get_the_title')) {
			function get_the_title($post_id) {
				return 'Test Page';
			}
		}

		if (!function_exists('get_post_type')) {
			function get_post_type($post_id) {
				return 'page';
			}
		}

		// Run analysis
		$this->document_usage->analyze();

		// Get usages
		$usages = $this->document_usage->get_usages();

		// Assert that usages were tracked
		$this->assertNotEmpty($usages);
		$this->assertArrayHasKey('global-class-1', $usages);
		$this->assertArrayHasKey('global-class-2', $usages);
	}

	public function testAnalyzeWithEmptyElementsData(): void {
		// Create document with empty data
		$empty_document = new class extends Document {
			public function __construct() {}

			public function get_elements_raw_data() {
				return [];
			}

			public function get_main_id() {
				return 1;
			}

			public function get_type() {
				return 'page';
			}
		};

		$document_usage = new Document_Usage($empty_document);
		$document_usage->analyze();

		$usages = $document_usage->get_usages();
		$this->assertEmpty($usages);
	}

	protected function tearDown(): void {
		Plugin::$instance = null;
		parent::tearDown();
	}
}
