<?php /** @noinspection PhpParamsInspection */

namespace Elementor\Testing\Includes\TemplateLibrary;

use \Elementor\TemplateLibrary\Manager;

require_once 'test-manager-general.php';


class Elementor_Test_Manager_Local extends Elementor_Test_Manager_general {

    public function setUp() {
        parent::setUp();
        wp_set_current_user($this->factory()->user->create(['role' => 'administrator']));
    }

    public function test_should_return_true_from_register_source() {
        $this->assertTrue($this->manager->register_source('Elementor\TemplateLibrary\Source_Local'));
    }

    public function test_should_return_true_from_unregister_source() {
        $this->assertTrue($this->manager->unregister_source('local'));
    }

    public function test_should_return_registered_sources() {
        $this->manager->register_source('Elementor\TemplateLibrary\Source_Local');
        $this->assertEquals($this->manager->get_registered_sources()['local'], new \Elementor\TemplateLibrary\Source_Local());
    }

    public function test_should_return_source() {
        $this->assertEquals($this->manager->get_source('local'), new \Elementor\TemplateLibrary\Source_Local());
    }

    public function test_should_return_wp_error_save_error_from_save_template() {
        wp_set_current_user($this->factory()->user->create(['role' => 'subscriber']));
        $this->assertWPError(
            $this->manager->save_template(
                [
                    'post_id' => '123',
                    'source' => 'local',
                    'content' => 'banana',
                    'type' => 'comment',
                ]
            ),
            'save_error');
    }

    public function test_should_return_template_data_from_save_template() {
        $template_data = [
            'post_id' => $this->factory()->post->create(['post_date' => '2014-11-11 23:45:30']),
            'source' => 'local',
            'content' => 'banana',
            'type' => 'page',
        ];

        $remote_remote = [
            'template_id' => 8,
            'source' => 'local',
            'type' => 'page',
            'title' => '(no title)',
            'thumbnail' => false,
            'hasPageSettings' => true,
            'tags' => [],
            'url' => 'http://example.org/?elementor_library=no-title',
        ];
        $this->assertArraySubset($remote_remote, $this->manager->save_template($template_data));
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

    public function test_should_return_wp_error_save_error_from_update_template() {
        wp_set_current_user($this->factory()->user->create(['role' => 'subscriber']));
        $this->assertWPError(
            $this->manager->update_template(
                [
                    'source' => 'local',
                    'content' => 'banana',
                    'type' => 'comment',
                    'id' => '777'
                ]
            ),
            'save_error');
    }

    /**
     *
     */
    public function test_should_return_template_data_from_update_template() {
        $template_data = [
            'source' => 'local',
            'content' => 'banana',
            'type' => 'post',
            'id' => $this->factory()->post->create(),
        ];

        $remote_remote = [
            'template_id' => 9,
            'source' => 'local',
            'type' => '',
            'title' => 'Post title 70',
            'thumbnail' => false,
            'author' => 'User 69',
            'hasPageSettings' => true,
            'tags' => [],
            'url' => 'http://example.org/?p=9',
        ];
        $this->assertArraySubset($remote_remote, $this->manager->update_template($template_data));
    }

    /**
     * @covers \Elementor\TemplateLibrary\Manager::get_template_data()
     */
    public function test_should_return_data_from_get_template_data() {
        $ret = $this->manager->get_template_data([
            'source' => 'local',
            'template_id' => '8',
        ]);

        $this->assertEquals($ret, ['content' => []]);
    }

    /**
     * @covers Manager::export_template
     */
    public function test_should_export_template() {
        $this->markTestSkipped();
        $ret = $this->manager->export_template(
            [
                'source' => 'local',
                'template_id' => \Elementor\Testing\Manager::$instance->get_local_factory()->get_local_template_id(),
            ]
        );
        $this->assertSame($ret, '');
    }

    /**
     * @requires PHP 5.3
     * @covers Manager::delete_template
     */
    public function test_should_delete_template() {
        $this->markTestSkipped();
        $template_id = \Elementor\Testing\Manager::$instance->get_local_factory()->get_local_template_id();
        $template = get_post($template_id);

        $ret = $this->manager->delete_template(
            [
                'source' => 'local',
                'template_id' => $template_id,
            ]
        );

        $this->assertEquals($ret, $template);
    }

    /**
     * @requires PHP 5.3
     * @covers Manager::import_template
     */
    public function test_should_import_template() {
        $this->markTestSkipped();
        $_FILES = [
            'file' => [
                'name' => 'no-title',
                'tmp_name' => 'http://example.org/?elementor_library=no-title',
            ]
        ];
        var_dump($this->manager->import_template());
    }

    /*    public function () {

        }*/


    /*	public function test_should_fail_to_mark_template_as_favorite() {
            $this->assertTrue( is_wp_error( $this->manager->mark_template_as_favorite( [ 'source' => 'remote' ] ) ) );
        }*/

}