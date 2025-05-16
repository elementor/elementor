<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use PHPUnit\Framework\TestCase;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Variables_Repository extends TestCase {
    private $kit;
    private $repository;

    protected function setUp(): void {
        parent::setUp();

        $this->kit = $this->createMock( Kit::class );
        $this->repository = new Variables_Repository( $this->kit );
    }

    public function test_list_of_variables__returns_default_when_empty() {
		// Arrange.
        $this->kit->method( 'get_json_meta' )->willReturn( null );

        // Act.
        $result = $this->repository->all();

		$expected = [
			'data' => [],
			'watermark' => 0,
			'version' => 1
		];

		// Assert.
        $this->assertEquals( $expected, $result );
    }

    public function test_list_of_variables__returns_existing_data() {
	    // Arrange.
	    $data = [
		    'data' => [
			    Color_Variable_Prop_Type::get_key() => [
				    'e-123' => [
					    'label' => 'Primary',
					    'value' => '#000000'
				    ],
				    'e-498' => [
					    'label' => 'Primary',
					    'value' => '#000000'
				    ],
			    ],
			    Font_Variable_Prop_Type::get_key() => [
				    'e-456' => [
					    'label' => 'Primary Font',
					    'value' => 'Robotto'
				    ],
			    ]
		    ],
		    'watermark' => 5
	    ];

	    $this->kit->method( 'get_json_meta' )->willReturn( $data );

	    // Act.
        $result = $this->repository->all();

	    // Assert.
	    $expected = $data;

        $this->assertEquals( $expected, $result );
    }

	public function test_create_new_variable__when_empty() {
		// Arrange.
		$captured_variables_data = null;
		$newVariable = [
			'label' => 'Secondary: Text Color',
			'value' => '#fff328'
		];

		$this->kit->expects( $this->once() )
		          ->method('update_json_meta')
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function ( $meta ) use ( &$captured_variables_data ) {
						  $color_variables = $meta['data'][ Color_Variable_Prop_Type::get_key() ];

				          $captured_variables_data = $meta['data'];

				          return isset( $color_variables ) && count( $color_variables ) === 1 && $meta['watermark'] === 1;
			          })
		          )
		          ->willReturn( '571234' );

		$this->kit->method( 'get_json_meta' )->willReturn( [] );

		// Act.
		$id = $this->repository->create( $newVariable, Color_Variable_Prop_Type::get_key() );

		$variables = $captured_variables_data[ Color_Variable_Prop_Type::get_key() ];

		// Assert.
		$this->assertEquals( array_key_first( $variables ), $id );
		$this->assertEquals( 'Secondary: Text Color', $variables[ $id ]['label'] );
		$this->assertEquals( '#fff328', $variables[ $id ]['value'] );
	}

    public function test_create_new_variable__in_existing_group() {
        // Arrange.
        $existingData = [
            'data' => [
	            Color_Variable_Prop_Type::get_key() => [
		            'e-123' => [
			            'label' => 'Primary',
			            'value' => '#000000'
		            ],
		            'e-456' => [
			            'label' => 'Secondary',
			            'value' => '#ffffff'
		            ]
	            ],
	            Font_Variable_Prop_Type::get_key() => [
		            'e-123' => [
			            'label' => 'Primary',
			            'value' => '#000000'
		            ]
	            ],
            ],
            'watermark' => 5,
            'version' => 1,
        ];
	    $captured_variables_data = null;

        $this->kit->method( 'get_json_meta' )->willReturn( $existingData );

        $this->kit->expects( $this->once() )
            ->method( 'update_json_meta' )
            ->with(
                Variables_Repository::VARIABLES_META_KEY,
                $this->callback( function( $meta ) use ( &$captured_variables_data ) {
	                $color_variables = $meta['data'][ Color_Variable_Prop_Type::get_key() ];

	                $captured_variables_data = $meta['data'];

	                return isset( $color_variables ) && count( $color_variables ) === 3 && $meta['watermark'] === 6;
                } )
            )
            ->willReturn( true );

        // Act.
        $newVariable = [ 'label' => 'New Text Color', 'value' => '#123098' ];
        $id = $this->repository->create( $newVariable, Color_Variable_Prop_Type::get_key() );

	    $color_variables = $captured_variables_data[ Color_Variable_Prop_Type::get_key() ];
	    $font_variables = $captured_variables_data[ Font_Variable_Prop_Type::get_key() ];

	    // Assert.
        $this->assertCount( 3, $color_variables );
        $this->assertCount( 1, $font_variables );
    }

    public function test_create_new_variable__in_font_group() {
        // Arrange.
	    $captured_variables_data = null;
	    $existingData = [
            'data' => [
                Color_Variable_Prop_Type::get_key() => [
                    'e-123' => [
						'label' => 'Primary',
						'value' => '#000000'
                    ],
                ],
            ],
            'watermark' => 10,
        ];

        $this->kit->method( 'get_json_meta' )->willReturn( $existingData );
        $this->kit->expects( $this->once() )
            ->method( 'update_json_meta' )
            ->with(
                Variables_Repository::VARIABLES_META_KEY,
                $this->callback( function( $meta ) use ( &$captured_variables_data ) {
	                $font_variables = $meta['data'][ Font_Variable_Prop_Type::get_key() ];

	                $captured_variables_data = $meta['data'];

	                return isset( $font_variables ) && count( $font_variables ) === 1 && $meta['watermark'] === 11;
                })
            )
            ->willReturn(true);

        // Act.
        $newVariable = ['label' => 'Primary Font', 'value' => 'Roboto'];
        $id = $this->repository->create( $newVariable, Font_Variable_Prop_Type::get_key() );

	    $variables = $captured_variables_data[ Font_Variable_Prop_Type::get_key() ];

	    // Assert.
	    $this->assertEquals( array_key_first( $variables ), $id );
	    $this->assertEquals( 'Primary Font', $variables[ $id ]['label'] );
	    $this->assertEquals( 'Roboto', $variables[ $id ]['value'] );
    }

    public function test_create_new_variable__throws_exception_when_save_fails() {
	    // Arrange.
        $this->kit->method( 'update_json_meta' )->willReturn( false );

        // Assert.
        $this->expectException( Exception::class );
        $this->expectExceptionMessage( 'Failed to create variable' );

	    $newVariable = [
			'label' => 'Test',
			'value' => 'test'
	    ];

	    // Act.
        $this->repository->create( $newVariable, Color_Variable_Prop_Type::get_key() );
    }

    public function test_update_variable__with_valid_data() {
        // Arrange.
	    $captured_variables_data = null;
		$id = 'e-123';

	    $existingData = [
            'data' => [
                Color_Variable_Prop_Type::get_key() => [
                    $id => [
						'label' => 'Primary',
						'value' => '#000000',
                    ],
                ],
            ],
            'watermark' => 8
        ];

        $this->kit->method( 'get_json_meta' )->willReturn( $existingData );
        $this->kit->expects( $this->once() )
            ->method( 'update_json_meta' )
            ->with(
                Variables_Repository::VARIABLES_META_KEY,
                $this->callback( function( $meta ) use ( &$captured_variables_data ) {
	                $captured_variables_data = $meta['data'];

	                return $meta['watermark'] === 9;
                })
            )
            ->willReturn(true);

        // Act.
        $updatedVariable = [ 'label' => 'Text Primary', 'value' => '#111111' ];
        $this->repository->update( Color_Variable_Prop_Type::get_key(), 'e-123', $updatedVariable );

	    $color_variables = $captured_variables_data[ Color_Variable_Prop_Type::get_key() ];

	    $this->assertEquals( $updatedVariable, $color_variables[ $id ] );
    }

    public function test_update_variable__throws_exception_when_save_fails() {
        // Arrange.
        $existingData = [
            'data' => [
                Color_Variable_Prop_Type::get_key() => [
                    'e-123' => [
						'label' => 'Primary',
						'value' => '#000000',
                    ],
                ],
            ],
            'watermark' => 5
        ];

        $this->kit->method( 'get_json_meta' )->willReturn( $existingData );
        $this->kit->method( 'update_json_meta' )->willReturn( false );

        // Assert.
        $this->expectException( Exception::class );
        $this->expectExceptionMessage( 'Failed to update variables' );

        // Act.
        $updatedVariable = [ 'label' => 'Primary', 'value' => '#111111' ];
        $this->repository->update( Color_Variable_Prop_Type::get_key(), 'e-123', $updatedVariable );
    }

    public function test_delete_variable__with_existing_variable() {
        // Arrange.
        $existingData = [
            'data' => [
                Color_Variable_Prop_Type::get_key() => [
                    'e-123' => [
						'label' => 'Primary',
						'value' => '#000000',
                    ],
                ],
            ],
            'watermark' => 5,
	        'version' => 1,
        ];
	    $captured_variables_data = null;

        $this->kit->method( 'get_json_meta' )->willReturn( $existingData );
        $this->kit->expects( $this->once() )
            ->method( 'update_json_meta' )
            ->with(
                Variables_Repository::VARIABLES_META_KEY,
                $this->callback( function( $meta ) use ( &$captured_variables_data ) {
	                $captured_variables_data = $meta['data'];

	                return true;
                })
            )
            ->willReturn( true );

        // Act.
        $result = $this->repository->delete( 'e-123', Color_Variable_Prop_Type::get_key() );

	    $variables = $captured_variables_data[ Color_Variable_Prop_Type::get_key() ];

	    // Assert.
        $this->assertTrue( $result );

	    $this->assertTrue( $variables[ 'e-123' ]['deleted'] );
	    $this->assertNotNull( $variables[ 'e-123' ]['deleted_at'] );
    }

    public function test_watermark__resets_when_reaching_max() {
        // Arrange.
        $existingData = [
            'data' => [
                Color_Variable_Prop_Type::get_key() => [
                    'e-123' => ['label' => 'Primary', 'value' => '#000000']
                ]
            ],
            'watermark' => PHP_INT_MAX
        ];

	    $captured_watermark = null;

        $this->kit->expects( $this->once() )
            ->method('update_json_meta')
            ->with(
                Variables_Repository::VARIABLES_META_KEY,
	            $this->callback( function ( $meta ) use ( &$captured_watermark ) {
					$captured_watermark = $meta['watermark'];

		            return true;
	            } )
            )
            ->willReturn(true);

	    // Act.
	    $this->repository->update(
			Color_Variable_Prop_Type::get_key(),
			'e-123',
		    [ 'label' => 'Tertiary', 'value' => '#123' ]
	    );

		$this->assertEquals( 1, $captured_watermark );
    }
}
