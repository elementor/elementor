<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Audits\Audit_Descriptor;
use Elementor\Modules\Audits\Audits_Manager;
use Elementor\Modules\Audits\Module;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fake_Audit extends Audit_Descriptor {

	public function get_id(): string {
		return 'fake/audit';
	}

	public function get_title(): string {
		return 'Fake';
	}

	public function get_description(): string {
		return 'desc';
	}

	public function get_fix_hint(): string {
		return 'fix';
	}

	public function get_categories(): array {
		return [ self::CATEGORY_SEO ];
	}

	public function get_severity(): string {
		return self::SEVERITY_WARNING;
	}

	public function get_weight(): int {
		return 1;
	}
}

class Test_Audits_Manager extends TestCase {

	public function setUp(): void {
		parent::setUp();
		remove_all_filters( Module::FILTER_AUDITS );
	}

	public function test_returns_built_in_descriptors_as_arrays() {
		// Arrange.
		$manager = new Audits_Manager();

		// Act.
		$descriptors = $manager->get_descriptors();

		// Assert.
		$this->assertNotEmpty( $descriptors );
		$ids = array_column( $descriptors, 'id' );
		$this->assertContains( 'audits/missing-page-title', $ids );
		$this->assertContains( 'audits/icon-widget-link-missing-aria-label', $ids );
	}

	public function test_third_parties_can_append_via_filter() {
		// Arrange.
		$manager = new Audits_Manager();
		add_filter( Module::FILTER_AUDITS, function ( $audits ) {
			$audits[] = new Fake_Audit();
			return $audits;
		} );

		// Act.
		$descriptors = $manager->get_descriptors();

		// Assert.
		$ids = array_column( $descriptors, 'id' );
		$this->assertContains( 'fake/audit', $ids );
	}

	public function test_invisible_audits_are_excluded() {
		// Arrange.
		$invisible = new class extends Fake_Audit {
			public function is_visible(): bool {
				return false;
			}
		};
		$manager = new Audits_Manager();
		add_filter( Module::FILTER_AUDITS, function ( $audits ) use ( $invisible ) {
			$audits[] = $invisible;
			return $audits;
		} );

		// Act.
		$descriptors = $manager->get_descriptors();

		// Assert.
		$ids = array_column( $descriptors, 'id' );
		$this->assertNotContains( $invisible->get_id(), $ids );
	}
}
