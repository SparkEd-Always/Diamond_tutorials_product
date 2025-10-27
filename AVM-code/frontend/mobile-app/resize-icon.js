const sharp = require('sharp');
const path = require('path');

async function createAdaptiveIcon() {
  const sourceLogo = '/Users/koustubskulkarni/AVM/product/SparkEd logo without padding.png';
  const outputPath = path.join(__dirname, 'assets', 'adaptive-icon.png');
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  // Android adaptive icon specs:
  // - Total size: 1024x1024
  // - Safe zone: center 66% (672x672)
  // - We'll make the logo fit within 550x550 for good padding

  const targetSize = 1024;
  const logoSize = 550; // Fits well within safe zone with padding
  const padding = (targetSize - logoSize) / 2;

  console.log('Creating adaptive icon from source logo...');
  console.log(`Target size: ${targetSize}x${targetSize}`);
  console.log(`Logo size: ${logoSize}x${logoSize}`);
  console.log(`Padding: ${padding}px on each side`);

  try {
    // Create adaptive icon (foreground on transparent background)
    await sharp(sourceLogo)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .extend({
        top: Math.floor(padding),
        bottom: Math.ceil(padding),
        left: Math.floor(padding),
        right: Math.ceil(padding),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Adaptive icon created: ${outputPath}`);

    // Also create regular icon (512x512 for iOS and web)
    await sharp(sourceLogo)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(iconPath);

    console.log(`✓ Regular icon created: ${iconPath}`);

    // Get info about the created files
    const adaptiveInfo = await sharp(outputPath).metadata();
    console.log(`\nAdaptive icon dimensions: ${adaptiveInfo.width}x${adaptiveInfo.height}`);

  } catch (error) {
    console.error('Error creating icons:', error);
    process.exit(1);
  }
}

createAdaptiveIcon();
