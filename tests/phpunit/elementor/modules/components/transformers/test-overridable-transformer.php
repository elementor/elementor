<?php

namespace Elementor\Testing\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\Components\Transformers\Overridable_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Overridable_Transformer extends Elementor_Test_Base {
    public function test_overridable_transformer_returns_original_value_when_overrides_are_empty() {
        // Arrange.
        $transformer = new Overridable_Transformer();
        $origin_value = [
            '$$type' => 'string',
            'value' => 'Original Text',
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $origin_value,
        ];

        $context = [ 'overrides' => [] ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $origin_value, $result );
    }

	public function test_overridable_transformer_returns_original_value_when_no_matching_override_is_found() {
        // Arrange.
        $transformer = new Overridable_Transformer();
        $origin_value = [
            '$$type' => 'link',
            'value' => [
                'destination' => [
                    '$$type' => 'url',
                    'value' => 'https://example.com',
                ],
                'isTargetBlank' => [
                    '$$type' => 'boolean',
                    'value' => false,
                ],
            ],
            
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $origin_value,
        ];

        $context = [
            'overrides' => [
                'other-override-key' => [
                    '$$type' => 'link',
                    'value' => [
                        'destination' => [
                            '$$type' => 'url',
                            'value' => 'https://other-example.com',
                        ],
                    ],
                ],
            ],
        ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $origin_value, $result );
    }

    public function test_overridable_transformer_returns_override_value_when_matching_override_is_found() {
        // Arrange.
        $transformer = new Overridable_Transformer();

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => [
                '$$type' => 'string',
                'value' => 'Original Text',
            ],
        ];

        $override_value = [
            '$$type' => 'string',
            'value' => 'Override Text',
        ];

        $context = [ 'overrides' => [ 'my-override-key' => $override_value ] ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $override_value, $result );
    }

    public function test_overridable_transformer_returns_original_value_when_matching_override_is_found_and_its_value_is_null() {
        // Arrange.
        $transformer = new Overridable_Transformer();
        $origin_value = [
            '$$type' => 'string',
            'value' => 'Original Text',
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $origin_value,
        ];

        $context = [ 'overrides' => [ 'my-override-key' => null ] ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $origin_value, $result );
    }

    public function test_overridable_transformer_handles_override_original_value_when_matching_override_is_found() {
        // Arrange.
        $transformer = new Overridable_Transformer();

        $origin_value = [
            '$$type' => 'override',
            'value' => [
                'override_key' => 'inner-override-key',
                'override_value' => [
                    '$$type' => 'string',
                    'value' => 'Inner Override Text',
                ],
            ],
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $origin_value,
        ];

        $outer_override_value = [
            '$$type' => 'string',
            'value' => 'Outer Override Text',
        ];

        $context = [
            'overrides' => [
                'my-override-key' => $outer_override_value
            ],
        ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( [
            'override_key' => 'inner-override-key',
            'override_value' => $outer_override_value,
        ], $result );
    }

    public function test_overridable_transformer_handles_override_original_value_when_matching_override_found_and_its_value_is_null() {
        // Arrange.
        $transformer = new Overridable_Transformer();

        $original_value = [
            '$$type' => 'override',
            'value' => [
                'override_key' => 'inner-override-key',
                'override_value' => [
                    '$$type' => 'string',
                    'value' => 'Inner Override Text',
                ],
            ],
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $original_value,
        ];

        $context = [
            'overrides' => [
                'my-override-key' => null,
            ],
        ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $original_value, $result );
    }

    public function test_overridable_transformer_handles_override_original_value_when_matching_override_not_found() {
        // Arrange.
        $transformer = new Overridable_Transformer();

        $original_value = [
            '$$type' => 'override',
            'value' => [
                'override_key' => 'inner-override-key',
                'override_value' => [
                    '$$type' => 'string',
                    'value' => 'Inner Override Text',
                ],
            ],
        ];

        $value = [
            'override_key' => 'my-override-key',
            'origin_value' => $original_value,
        ];

        $context = [
            'overrides' => [
                'other-override-key' => [
                    '$$type' => 'string',
                    'value' => 'Other Override Text',
                ],
            ],
        ];

        // Act.
        Render_Context::push( Overridable_Transformer::class, $context );
        $result = $transformer->transform( $value, Props_Resolver_Context::make() );
        Render_Context::pop( Overridable_Transformer::class );

        // Assert.
        $this->assertEquals( $original_value, $result );
    }
}
