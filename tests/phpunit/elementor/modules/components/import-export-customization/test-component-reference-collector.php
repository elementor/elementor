<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Export;
use Elementor\Modules\Components\Variants\Component_Variants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Stub_Components_Repository_For_Export extends Components_Repository {
	public array $components = [];

	public function all(): Collection {
		$items = array_map(
			fn( Component_Document $component ) => [
				'id' => $component->get_main_id(),
			],
			array_values( $this->components )
		);

		return Collection::make( $items );
	}

	public function get( $id, bool $include_autosave = true ) {
		return $this->components[ $id ] ?? null;
	}
}

class Test_Component_Export_Runner extends TestCase {
	public function test_export_serializes_all_components_from_the_repository() {
		// Arrange.
		$repository = new Stub_Components_Repository_For_Export();
		$repository->components = [
			10 => $this->make_component_document( 10, 'Hero', 'uid-10' ),
			20 => $this->make_component_document( 20, 'Footer', 'uid-20' ),
		];
		$runner = new Export( $repository );

		// Act.
		$result = $runner->export( [] );

		// Assert.
		$components_manifest = $result['manifest'][0]['content'][ Component_Document::TYPE ];
		$this->assertSame( [ 10, 20 ], array_keys( $components_manifest ) );
		$this->assertSame( 'Hero', $components_manifest[10]['title'] );
		$this->assertCount( 3, $result['files'] );
		$this->assertSame( 'content/elementor_component/10', $result['files'][0]['path'] );
		$this->assertSame( 'content/elementor_component/20', $result['files'][1]['path'] );
		$this->assertSame( 'uid-10', $result['files'][0]['data']['component']['uid'] );
	}

	public function test_export_writes_dependencies_file_keyed_by_component_id() {
		// Arrange.
		$repository = new Stub_Components_Repository_For_Export();
		$repository->components = [
			10 => $this->make_component_document( 10, 'Hero', 'uid-10' ),
			20 => $this->make_component_document( 20, 'Footer', 'uid-20', [ $this->make_component_instance_element( 10 ) ] ),
		];
		$runner = new Export( $repository );

		// Act.
		$result = $runner->export( [] );

		// Assert.
		$dependencies_file = end( $result['files'] );
		$this->assertSame( Import_Export_Customization::DEPENDENCIES_FILE_PATH, $dependencies_file['path'] );
		$this->assertSame(
			[
				10 => [ 'depends_on' => [] ],
				20 => [ 'depends_on' => [ 10 ] ],
			],
			$dependencies_file['data']['dependencies']
		);
	}

	private function make_component_instance_element( int $component_id ): array {
		return [
			'id' => 'instance-' . $component_id,
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [
							'$$type' => 'number',
							'value' => $component_id,
						],
					],
				],
			],
		];
	}

	private function make_component_document( int $id, string $title, string $uid, array $content = [] ): Component_Document {
		$document = $this->createMock( Component_Document::class );
		$post = (object) [
			'post_title' => $title,
			'post_status' => 'publish',
		];

		$document->method( 'get_main_id' )->willReturn( $id );
		$document->method( 'get_main_post' )->willReturn( $post );
		$document->method( 'get_component_uid' )->willReturn( $uid );
		$document->method( 'get_is_archived' )->willReturn( false );
		$document->method( 'get_overridable_props' )->willReturn( Component_Overridable_Props::make( [] ) );
		$document->method( 'get_variants' )->willReturn( Component_Variants::make( [] ) );
		$document->method( 'get_export_data' )->willReturn( [
			'content' => $content,
			'settings' => [],
			'metadata' => [],
		] );

		return $document;
	}
}
