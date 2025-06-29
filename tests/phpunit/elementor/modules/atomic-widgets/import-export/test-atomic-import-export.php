<?php

namespace Elementor\Testing\Modules\AtomicWidgets\ImportExport;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\ImportExport\Atomic_Import_Export;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Attachment_Id_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\TemplateLibrary\Classes\Import_Images;

class Test_Atomic_Import_Export extends Elementor_Test_Base {
	use MatchesSnapshots;

	private $old_templates_manager;

	public function set_up() {
		parent::set_up();

		$this->old_templates_manager = Plugin::$instance->templates_manager;

		remove_all_filters( 'elementor/template_library/sources/local/import/elements' );
		remove_all_filters( 'elementor/template_library/sources/local/export/elements' );
		remove_all_filters( 'elementor/document/element/replace_id' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->templates_manager = $this->old_templates_manager;
	}

	public function test_on_export() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', fn() => [ 'https://example.local/image.jpg' ] );

		( new Atomic_Import_Export() )->register_hooks();

		$image = Image_Prop_Type::generate( [
			'src' => Image_Src_Prop_Type::generate( [
				'id'  => Image_Attachment_Id_Prop_Type::generate( 1 ),
				'url' => null,
			] ),
			'size' => String_Prop_Type::generate( 'full' ),
		] );

		$data = [
			[
				'id' => 'test-container',
				'elType' => 'container',
				'elements' => [
					[
						'id' => 'test-image',
						'elType' => 'widget',
						'widgetType' => Atomic_Image::get_element_type(),
						'settings' => [
							'image' => array_merge(
								$image,
								[ 'disabled' => true ]
							),
							'classes' => Classes_Prop_Type::generate( [ 'test-class' ] ),
						],
						'styles' => [
							'test-style-id' => Style_Definition::make()
								->set_label( 'test' )
								->add_variant(
									Style_Variant::make()
										->add_prop(
											'background',
											Background_Prop_Type::generate( [
												'background-overlay' => Background_Overlay_Prop_Type::generate([
													Background_Image_Overlay_Prop_Type::generate([
														'image' => $image
													])
												])
											] )
										)
										->add_prop( 'color', Color_Prop_Type::generate( '#000000' ) )
								)
								->build( 'test-style-id' )
						],
					],
				]
			],
			[
				'id' => 'not-atomic',
				'elType' => 'widget',
				'widgetType' => 'image',
				'settings' => [
					'image' => $image,
					'some-other' => 'value',
				],
			],
		];

		// Act.
		$result = apply_filters( 'elementor/template_library/sources/local/export/elements', $data );

		// Assert.
		$this->assertMatchesSnapshot( $result );
	}

	public function test_on_import(  ) {
		// Arrange.
		$import_images_mock = $this->getMockBuilder( Import_Images::class )
			->setMethods( [ 'import' ] )
			->getMock();

		$import_images_mock->method( 'import' )->willReturn( [
			'id' => 20,
			'url' => 'https://example.local/image.jpg',
		] );

		$template_manager_mock = Plugin::$instance->templates_manager = $this->getMockBuilder( Manager::class )
			->setMethods( [ 'get_import_images_instance' ] )
			->getMock();

		$template_manager_mock->method( 'get_import_images_instance' )->willReturn( $import_images_mock );

		( new Atomic_Import_Export() )->register_hooks();

		$image = Image_Prop_Type::generate( [
			'src' => Image_Src_Prop_Type::generate( [
				'id'  => Image_Attachment_Id_Prop_Type::generate( 1 ),
				'url' => Url_Prop_Type::generate( 'https://example.local/image.jpg' ),
			] ),
			'size' => String_Prop_Type::generate( 'full' ),
		] );

		$data = [
			[
				'id' => 'test-container',
				'elType' => 'container',
				'elements' => [
					[
						'id' => 'test-image',
						'elType' => 'widget',
						'widgetType' => Atomic_Image::get_element_type(),
						'settings' => [
							'image' => array_merge(
								$image,
								[ 'disabled' => true ]
							),
							'classes' => Classes_Prop_Type::generate( [ 'test-class' ] ),
						],
						'styles' => [
							'test-style-id' => Style_Definition::make()
								->set_label( 'test' )
								->add_variant(
									Style_Variant::make()
										->add_prop(
											'background',
											Background_Prop_Type::generate( [
												'background-overlay' => Background_Overlay_Prop_Type::generate([
													Background_Image_Overlay_Prop_Type::generate([
														'image' => $image
													])
												])
											] )
										)
										->add_prop( 'color', Color_Prop_Type::generate( '#000000' ) )
								)
								->build( 'test-style-id' )
						],
					],
				]
			],
			[
				'id' => 'not-atomic',
				'elType' => 'widget',
				'widgetType' => 'image',
				'settings' => [
					'image' => $image,
					'some-other' => 'value',
				],
			],
		];

		// Expect.
		$import_images_mock->expects($this->exactly(2))->method('import');

		// Act.
		$result = apply_filters( 'elementor/template_library/sources/local/import/elements', $data );

		// Assert.
		$this->assertMatchesSnapshot( $result );
	}

	public function test_replace_ids() {
		// Arrange.
		( new Atomic_Import_Export() )->register_hooks();

		$data = [
			'id' => 'test-id',
			'elType' => 'widget',
			'widgetType' => Atomic_Heading::get_element_type(),
			'styles' => [
				'e-test-id-1' => [
					'id' => 'e-test-style-1',
				],
				'e-test-id-2' => [
					'id' => 'e-test-style-2',
				],
			],
			'settings' => [
				'classes' => Classes_Prop_Type::generate( [ 'e-test-id-1', 'some-other-class' ] ),
				'title' => String_Prop_Type::generate( 'Test' ),
			],
		];

		// Act.
		$data['id'] = 'modified-id';

		$result = apply_filters( 'elementor/document/element/replace_id', $data );

		// Assert.
		$style_ids = array_keys( $result['styles'] );

		$this->assertCount( 2, $style_ids );
		$this->assertMatchesRegularExpression( '/^e-modified-id-[a-z0-9]{7}$/', $style_ids[0] );
		$this->assertMatchesRegularExpression( '/^e-modified-id-[a-z0-9]{7}$/', $style_ids[1] );

		$this->assertEqualSets( [
			'id' => 'modified-id',
			'elType' => 'widget',
			'widgetType' => Atomic_Heading::get_element_type(),
			'styles' => [
				$style_ids[0] => [
					'id' => $style_ids[0],
				],
				$style_ids[1] => [
					'id' => $style_ids[1],
				],
			],
			'settings' => [
				'classes' => Classes_Prop_Type::generate( [ $style_ids[0], 'some-other-class' ] ),
				'title' => String_Prop_Type::generate( 'Test' ),
			],
		], $result );
	}
}
