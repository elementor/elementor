# Post-Based Experiment Testing System

This system allows you to control Elementor onboarding experiments and their variants using WordPress posts. No functions.php modifications needed!

## How It Works

The system automatically checks for WordPress posts with specific titles to control experiments:

### Experiment Control
- **Post Title**: Use the experiment number (e.g., "101", "201", "401", "402")
- **Post Existence**: If a post with the experiment number exists, that experiment is enabled
- **Post Content**: Determines the variant (A or B)

### Variant Control
All enabled experiments automatically use **Variant B**. No post content configuration needed.

## Quick Setup Guide

### Step 1: Enable Experiment 101
1. Create a new post
2. Set title to: **101**
3. Publish the post
4. Experiment 101 is now active with Variant B

### Step 2: Enable Experiment 201  
1. Create a new post
2. Set title to: **201**
3. Publish the post
4. Experiment 201 is now active with Variant B

### Step 3: Test
Visit the Elementor onboarding flow - experiments 101 and 201 will be active with Variant B!

## Available Experiments

| Experiment Number | Experiment Key | Description |
|-------------------|----------------|-------------|
| **101** | `emphasizeConnectBenefits101` | Emphasize Connect Benefits |
| **201** | `offerThemeChoicesHelloBiz201` | Offer Theme Choices Hello Biz |
| **401** | `updateCopyVisuals401` | Update Copy Visuals |
| **402** | `reduceHierarchyBlankOption402` | Reduce Hierarchy Blank Option |

## Examples

### Example 1: Enable Experiment 101
- **Post Title**: `101`
- **Result**: Experiment 101 active with Variant B

### Example 2: Enable Experiment 201
- **Post Title**: `201` 
- **Result**: Experiment 201 active with Variant B

### Example 3: Enable Multiple Experiments
Create multiple posts:
- Post 1: Title `101`
- Post 2: Title `401` 
- Post 3: Title `402`
- **Result**: All experiments active with Variant B

### Example 4: Disable All Experiments
Simply delete all posts with experiment number titles (101, 201, 401, 402)

## Advanced Usage

### Post Types
The system works with any post type:
- Regular posts
- Pages  
- Custom post types

### Post Status
The system works with any post status:
- Published
- Draft
- Private
- Custom statuses

### Content Examples
Post content can be anything - it's not used for variant determination:
- `Testing experiment 101`
- `B variant test`
- `Experiment notes and details`
- Or leave content empty

## Technical Details

### How It Works Behind the Scenes

1. **PHP Side**: 
   - `API::is_experiment_enabled()` checks for posts with experiment number titles
   - If post exists, experiment is enabled
   - No variant configuration needed in PHP

2. **JavaScript Side**:
   - `post-based-variants.js` automatically sets all enabled experiments to Variant B
   - Sets localStorage values that existing experiment code expects
   - Existing onboarding JavaScript uses localStorage variants normally

### Files Modified
- `plugins/elementor/app/modules/onboarding/api.php` - Added post checking logic
- `plugins/elementor/app/modules/onboarding/module.php` - Added JavaScript file enqueuing  
- `plugins/elementor/app/modules/onboarding/assets/js/post-based-variants.js` - New JavaScript handler (sets Variant B)

## Troubleshooting

### Experiment Not Activating
1. Check post title is exactly the experiment number (e.g., "101")
2. Verify post exists and is not in trash
3. Check browser console for JavaScript errors
4. Clear localStorage and refresh page

### Variant Not Working
1. All experiments automatically use Variant B when enabled
2. Verify JavaScript console shows `'B'` in localStorage for experiment keys
3. Clear browser cache and localStorage
4. Check that experiment is enabled first

### Debug Mode
Check browser console localStorage for these keys:
- `elementor_onboarding_experiment101_variant` should be `'B'`
- `elementor_onboarding_experiment201_variant` should be `'B'`
- etc.

## Performance Notes

- Post queries are cached by WordPress
- Only runs during onboarding flow (not on every page)
- Minimal performance impact
- Uses efficient `get_posts()` with `fields => 'ids'` when possible

## Security Considerations

- System only reads post titles and content
- No user input is executed as code
- Works with WordPress's existing post permissions
- Safe for production use
