<?php

namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Manager;

class Elementor_Test_Manager_general extends \WP_UnitTestCase {
    /**
     * @var Manager
     */
    protected $manager;

    public function setUp() {
        parent::setUp();
        $this->manager = Plugin::$instance->templates_manager;
    }

    public function test_should_return_import_images_instance() {
        $this->assertEquals($this->manager->get_import_images_instance(), new \Elementor\TemplateLibrary\Classes\Import_Images());
    }

    public function test_should_return_wp_error_source_class_name_not_exists_from_register_source() {
        $this->assertWPError($this->manager->register_source('pop'), 'source_class_name_not_exists');
    }

    public function test_should_return_wp_error_wrong_instance_source_from_register_source() {
        $this->assertWPError($this->manager->register_source('Elementor\Core\Ajax_Manager'), 'wrong_instance_source');
    }


    public function test_should_return_false_from_unregister_source() {
        $this->assertFalse($this->manager->unregister_source(0));
    }

    public function test_should_fail_to_return_source() {
        $this->assertFalse($this->manager->get_source('pop'));
    }

    public function mockGetTemplate() {
        $templatesArray = [];
        $sourceArray['local'] = new \Elementor\TemplateLibrary\Source_Local();
        $sourceArray['remote'] = new \Elementor\TemplateLibrary\Source_Remote();
        foreach ($sourceArray as $source) {
            $templatesArray = array_merge($templatesArray, $source->get_items());
        }
        return $templatesArray;
    }

    public function test_should_return_templates() {
        //run & check.
        $this->manager->register_source('Elementor\TemplateLibrary\Source_Remote');
        $this->manager->register_source('Elementor\TemplateLibrary\Source_Local');
        $this->assertEquals($this->manager->get_templates(), $this->mockGetTemplate());
    }

    public function test_should_return_library_data() {
        $template = $this->mockGetTemplate();
        $config = ['404 page', 'about', 'archive', 'call to action', 'clients', 'contact', 'faq', 'features', 'footer', 'header', 'hero', 'portfolio', 'pricing', 'services', 'single page', 'single post', 'stats', 'subscribe', 'team', 'testimonials'];

        $this->manager->register_source('Elementor\TemplateLibrary\Source_Remote');
        $this->manager->register_source('Elementor\TemplateLibrary\Source_Local');

        $ret = $this->manager->get_library_data([]);

        $this->assertEquals(
            [
                'templates' => $template,
                'config' => [
                    'categories' => $config
                ]
            ],
            $ret);
    }

    public function test_should_return_library_data_send_this_parameters() {
        $template = $this->mockGetTemplate();
        $config = ['404 page', 'about', 'archive', 'call to action', 'clients', 'contact', 'faq', 'features', 'footer', 'header', 'hero', 'portfolio', 'pricing', 'services', 'single page', 'single post', 'stats', 'subscribe', 'team', 'testimonials'];

        $this->manager->register_source('Elementor\TemplateLibrary\Source_Remote');
        $this->manager->register_source('Elementor\TemplateLibrary\Source_Local');

        $ret = $this->manager->get_library_data(['sync' => true]);

        $this->assertEquals(
            [
                'templates' => $template,
                'config' => [
                    'categories' => $config
                ]
            ],
            $ret);
    }

    public function test_should_return_wp_error_arguments_not_specified_from_save_template() {
        $this->assertWPError(
            $this->manager->save_template(['post_id' => '123'])
            , 'arguments_not_specified');
    }

    public function test_should_return_wp_error_template_error_from_save_template() {
        $this->assertWPError(
            $this->manager->save_template(
                [
                    'post_id' => '123',
                    'source' => 'banana',
                    'content' => 'banana',
                    'type' => 'page',
                ]
            ),
            'template_error');
    }




    public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
        $this->assertWPError(
            $this->manager->update_template(['post_id' => '123'])
            , 'arguments_not_specified');
    }


    public function test_should_return_wp_error_template_error_from_update_template() {
        $this->assertWPError(
            $this->manager->update_template(
                [
                    'source' => 'banana',
                    'content' => 'banana',
                    'type' => 'page',
                ]
            ),
            'template_error');
    }

    public function test_should_return_wp_error_update_templates() {
        $templates = [
            'templates' => [
                [
                    'source' => 'apple',
                    'content' => 'banana',
                    'type' => 'comment',
                    'id' => 1
                ],
                [
                    'source' => 'banana',
                    'content' => 'banana',
                    'type' => 'comment',
                    'id' => 1
                ]
            ]
        ];
        $this->assertWPError($this->manager->update_templates($templates));
    }

    public function test_should_return_true_from_update_templates() {
        wp_set_current_user($this->factory()->user->create(['role' => 'administrator']));
        $templates = [
            'templates' => [
                [
                    'source' => 'remote',
                    'content' => 'banana',
                    'type' => 'comment',
                    'id' => 1
                ],
                [
                    'source' => 'local',
                    'content' => 'banana',
                    'type' => 'comment',
                    'id' => $this->factory()->post->create([])
                ]
            ]
        ];
        $this->assertTrue($this->manager->update_templates($templates));
    }


    public function test_should_return_wp_error_massage_arguments_not_specified_from_get_template_data() {
        $this->assertWPError($this->manager->get_template_data([]), 'arguments_not_specified');
    }

    public function test_should_return_wp_error_massage_template_error_from_get_template_data() {
        $this->assertWPError($this->manager->get_template_data([
            'source' => 'banana',
            'template_id' => '777',
            'edit_mode' => true
        ]), 'template_error');
    }

    public function test_should_return_wp_error_arguments_not_specified_from_delete_template() {
        $this->assertWPError($this->manager->delete_template([]), 'arguments_not_specified');
    }

    public function test_should_return_wp_error_template_error_from_delete_template() {
        $this->assertWPError($this->manager->delete_template(
            [
                'source' => 'banana',
                'template_id' => '777',
            ]
        ), 'template_error');
    }

    public function test_should_return_wp_error_arguments_not_specified_from_export_template() {
        $this->assertWPError($this->manager->export_template([]), 'arguments_not_specified');
    }

    public function test_should_return_wp_error_template_error_from_export_template() {
        $this->assertWPError($this->manager->export_template(
            [
                'source' => 'banana',
                'template_id' => '777',
            ]
        ), 'template_error');
    }

    /*    public function () {

        }*/


    /*	public function test_should_fail_to_mark_template_as_favorite() {
            $this->assertTrue( is_wp_error( $this->manager->mark_template_as_favorite( [ 'source' => 'remote' ] ) ) );
        }*/

}