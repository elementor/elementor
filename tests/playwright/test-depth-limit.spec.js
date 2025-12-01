const { test, expect } = require('@playwright/test');

test.describe('Elementor Depth Limit Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://elementor.local:10003/wp-login.php');
    await page.fill('#user_login', 'admin');
    await page.fill('#user_pass', 'password');
    await page.click('#wp-submit');
    await page.waitForURL('**/wp-admin/**', { timeout: 60000 });
  });

  const createNestedStructure = (depth) => {
    let widget = {
      id: 'test-widget',
      elType: 'widget',
      widgetType: 'e-heading',
      settings: {
        title: { $$type: 'string', value: `Depth ${depth} test` }
      },
      isInner: false,
      styles: [],
      editor_settings: {},
      version: '0.0',
      elements: []
    };
    
    for (let i = 0; i < depth - 1; i++) {
      widget = {
        id: `container-${i}`,
        elType: 'e-div-block',
        settings: { classes: { $$type: 'classes', value: [] } },
        isInner: false,
        styles: [],
        editor_settings: {},
        version: '0.0',
        elements: [widget]
      };
    }
    
    return [widget];
  };

  [3, 6, 9, 12, 15].forEach((depth) => {
    test(`Test depth ${depth}`, async ({ page, request }) => {
      console.log(`\n🧪 Testing depth ${depth}`);
      
      const structure = createNestedStructure(depth);
      
      const saveResponse = await request.post('http://elementor.local:10003/wp-json/wp/v2/posts/60822', {
        data: {
          meta: {
            _elementor_data: JSON.stringify(structure)
          }
        },
        headers: {
          'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
        }
      });
      
      await page.goto('http://elementor.local:10003/wp-admin/post.php?post=60822&action=elementor');
      await page.waitForTimeout(3000);
      
      const elementsCount = await page.evaluate(() => {
        return elementor?.elements?.models?.length || 0;
      });
      
      const hasElements = elementsCount > 0;
      console.log(`  Depth ${depth}: elementsCount=${elementsCount}, hasElements=${hasElements}`);
      
      if (hasElements) {
        console.log(`  ✅ SUCCESS: Depth ${depth} renders correctly`);
      } else {
        console.log(`  ❌ FAILED: Depth ${depth} does not render`);
      }
      
      expect(hasElements).toBe(true);
    });
  });
});




