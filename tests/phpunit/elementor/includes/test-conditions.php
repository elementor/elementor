<?php
namespace Elementor\Tests;

use Elementor\Conditions;

class Test_Conditions extends \Elementor\Testing\ElementorTestCase {
    
    public function test_check_with_missing_comparison_key() {
        // Arrange
        $conditions = [
            'terms' => [
                [
                    'name' => 'missing_key',
                    'value' => 'some_value'
                ]
            ]
        ];
        $comparison = [
            'existing_key' => 'value'
        ];

        // Act
        $result = Conditions::check($conditions, $comparison);

        // Assert
        // Az üres string összehasonlítva bármilyen értékkel false-t kell adjon
        $this->assertFalse($result);
    }

    public function test_check_with_existing_comparison_key() {
        // Arrange
        $conditions = [
            'terms' => [
                [
                    'name' => 'existing_key',
                    'value' => 'test_value'
                ]
            ]
        ];
        $comparison = [
            'existing_key' => 'test_value'
        ];

        // Act
        $result = Conditions::check($conditions, $comparison);

        // Assert
        $this->assertTrue($result);
    }

    public function test_check_with_nested_missing_key() {
        // Arrange
        $conditions = [
            'terms' => [
                [
                    'name' => 'parent[missing_child]',
                    'value' => 'test_value'
                ]
            ]
        ];
        $comparison = [
            'parent' => ['existing_child' => 'value']
        ];

        // Act
        $result = Conditions::check($conditions, $comparison);

        // Assert
        $this->assertFalse($result);
    }
}
