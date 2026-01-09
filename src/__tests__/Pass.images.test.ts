import { Pass, createPass } from '../Pass';
import { PassData, PassImage, PassImageType } from '../types';
import JSZip from 'jszip';

describe('Pass Image Handling Edge Cases', () => {
  const minimalPassData: PassData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.example.test',
    serialNumber: 'TEST-001',
    teamIdentifier: 'ABCD1234',
    organizationName: 'Test Organization',
    description: 'Test Pass',
  };

  describe('Image Types', () => {
    it('should handle Icon image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();

      const content = await zip.file('icon.png')!.async('uint8array');
      expect(content).toEqual(new Uint8Array([1, 2, 3]));
    });

    it('should handle Logo image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Logo, data: new Uint8Array([4, 5, 6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('logo.png')).not.toBeNull();

      const content = await zip.file('logo.png')!.async('uint8array');
      expect(content).toEqual(new Uint8Array([4, 5, 6]));
    });

    it('should handle Strip image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Strip, data: new Uint8Array([7, 8, 9]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('strip.png')).not.toBeNull();
    });

    it('should handle Background image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Background, data: new Uint8Array([10, 11, 12]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('background.png')).not.toBeNull();
    });

    it('should handle Footer image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Footer, data: new Uint8Array([13, 14, 15]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('footer.png')).not.toBeNull();
    });

    it('should handle Thumbnail image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Thumbnail, data: new Uint8Array([16, 17, 18]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('thumbnail.png')).not.toBeNull();
    });

    it('should handle PersonalizationLogo image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.PersonalizationLogo, data: new Uint8Array([19, 20, 21]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('personalizationLogo.png')).not.toBeNull();
    });

    it('should handle all image types simultaneously', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, data: new Uint8Array([2]) },
        { type: PassImageType.Strip, data: new Uint8Array([3]) },
        { type: PassImageType.Background, data: new Uint8Array([4]) },
        { type: PassImageType.Footer, data: new Uint8Array([5]) },
        { type: PassImageType.Thumbnail, data: new Uint8Array([6]) },
        { type: PassImageType.PersonalizationLogo, data: new Uint8Array([7]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();
      expect(zip.file('strip.png')).not.toBeNull();
      expect(zip.file('background.png')).not.toBeNull();
      expect(zip.file('footer.png')).not.toBeNull();
      expect(zip.file('thumbnail.png')).not.toBeNull();
      expect(zip.file('personalizationLogo.png')).not.toBeNull();
    });
  });

  describe('Scale Factors', () => {
    it('should handle scale 1 (1x)', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('icon@1x.png')).toBeNull();
    });

    it('should handle scale 2 (2x)', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon@2x.png')).not.toBeNull();
      expect(zip.file('icon.png')).toBeNull();
    });

    it('should handle scale 3 (3x)', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 3, data: new Uint8Array([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon@3x.png')).not.toBeNull();
      expect(zip.file('icon.png')).toBeNull();
    });

    it('should handle undefined scale as 1x', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
    });

    it('should handle all scale factors for same image type', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Logo, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Logo, scale: 3, data: new Uint8Array([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('logo.png')).not.toBeNull();
      expect(zip.file('logo@2x.png')).not.toBeNull();
      expect(zip.file('logo@3x.png')).not.toBeNull();
    });

    it('should handle multiple image types with different scales', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Logo, scale: 2, data: new Uint8Array([3]) },
        { type: PassImageType.Logo, scale: 3, data: new Uint8Array([4]) },
        { type: PassImageType.Strip, scale: 3, data: new Uint8Array([5]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('icon@2x.png')).not.toBeNull();
      expect(zip.file('logo@2x.png')).not.toBeNull();
      expect(zip.file('logo@3x.png')).not.toBeNull();
      expect(zip.file('strip@3x.png')).not.toBeNull();

      // Verify these don't exist
      expect(zip.file('icon@3x.png')).toBeNull();
      expect(zip.file('logo.png')).toBeNull();
      expect(zip.file('strip.png')).toBeNull();
    });
  });

  describe('Empty Image Data', () => {
    it('should handle empty Uint8Array for image data', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();

      const content = await icon!.async('uint8array');
      expect(content.length).toBe(0);
    });

    it('should include empty image in manifest with valid hash', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toBeDefined();
      // SHA1 of empty string is da39a3ee5e6b4b0d3255bfef95601890afd80709
      expect(manifest['icon.png']).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    });

    it('should handle multiple empty images', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([]) },
        { type: PassImageType.Logo, data: new Uint8Array([]) },
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();
      expect(zip.file('strip@2x.png')).not.toBeNull();
    });
  });

  describe('Very Large Image Data', () => {
    it('should handle 1MB image data', async () => {
      const largeData = new Uint8Array(1024 * 1024);
      // Fill with some pattern
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = i % 256;
      }

      const images: PassImage[] = [
        { type: PassImageType.Background, data: largeData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const background = zip.file('background.png');
      expect(background).not.toBeNull();

      const content = await background!.async('uint8array');
      expect(content.length).toBe(1024 * 1024);
      expect(content[0]).toBe(0);
      expect(content[255]).toBe(255);
    });

    it('should handle 5MB image data', async () => {
      const largeData = new Uint8Array(5 * 1024 * 1024);
      largeData.fill(42);

      const images: PassImage[] = [
        { type: PassImageType.Strip, data: largeData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const strip = zip.file('strip.png');
      expect(strip).not.toBeNull();

      const content = await strip!.async('uint8array');
      expect(content.length).toBe(5 * 1024 * 1024);
    });

    it('should correctly hash large image data in manifest', async () => {
      const largeData = new Uint8Array(1024 * 1024);
      largeData.fill(0);

      const images: PassImage[] = [
        { type: PassImageType.Icon, data: largeData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);
    });
  });

  describe('Duplicate Image Types with Same Scale', () => {
    it('should use last image when same type and scale are provided', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1, 1, 1]) },
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([2, 2, 2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();

      const content = await icon!.async('uint8array');
      // The second image should overwrite the first
      expect(content).toEqual(new Uint8Array([2, 2, 2]));
    });

    it('should use last image when same type without scale (both default 1x)', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Logo, data: new Uint8Array([10]) },
        { type: PassImageType.Logo, data: new Uint8Array([20]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const logo = zip.file('logo.png');
      expect(logo).not.toBeNull();

      const content = await logo!.async('uint8array');
      expect(content).toEqual(new Uint8Array([20]));
    });

    it('should handle mixed explicit and implicit scale 1', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();

      const content = await icon!.async('uint8array');
      expect(content).toEqual(new Uint8Array([2]));
    });

    it('should correctly handle multiple duplicates', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([1]) },
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([3]) },
        { type: PassImageType.Strip, scale: 2, data: new Uint8Array([4]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const strip = zip.file('strip@2x.png');
      expect(strip).not.toBeNull();

      const content = await strip!.async('uint8array');
      expect(content).toEqual(new Uint8Array([4]));
    });
  });

  describe('Missing Required Images', () => {
    it('should generate pass without any images', async () => {
      const pass = createPass(minimalPassData, []);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('pass.json')).not.toBeNull();
      expect(zip.file('manifest.json')).not.toBeNull();

      // No image files
      expect(zip.file('icon.png')).toBeNull();
      expect(zip.file('logo.png')).toBeNull();
    });

    it('should generate pass with only icon (no logo)', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).toBeNull();
    });

    it('should generate pass with only optional images', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Footer, data: new Uint8Array([1]) },
        { type: PassImageType.Thumbnail, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('footer.png')).not.toBeNull();
      expect(zip.file('thumbnail.png')).not.toBeNull();
      expect(zip.file('icon.png')).toBeNull();
      expect(zip.file('logo.png')).toBeNull();
    });

    it('should have correct manifest entries for present images only', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['logo.png']).toBeUndefined();
      expect(manifest['strip.png']).toBeUndefined();
    });
  });

  describe('Buffer vs Uint8Array Data Types', () => {
    it('should handle Uint8Array image data', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3, 4]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();

      const content = await icon!.async('uint8array');
      expect(content).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    it('should handle Buffer image data (Node.js environment)', async () => {
      // Buffer.from creates a Buffer which is a subclass of Uint8Array
      const bufferData = Buffer.from([5, 6, 7, 8]);
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: bufferData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const icon = zip.file('icon.png');
      expect(icon).not.toBeNull();

      const content = await icon!.async('uint8array');
      expect(content).toEqual(new Uint8Array([5, 6, 7, 8]));
    });

    it('should handle mixed Buffer and Uint8Array images', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2]) },
        { type: PassImageType.Logo, data: Buffer.from([3, 4]) },
        { type: PassImageType.Strip, data: new Uint8Array([5, 6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);

      const iconContent = await zip.file('icon.png')!.async('uint8array');
      expect(iconContent).toEqual(new Uint8Array([1, 2]));

      const logoContent = await zip.file('logo.png')!.async('uint8array');
      expect(logoContent).toEqual(new Uint8Array([3, 4]));

      const stripContent = await zip.file('strip.png')!.async('uint8array');
      expect(stripContent).toEqual(new Uint8Array([5, 6]));
    });

    it('should handle Buffer with different scale factors', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: Buffer.from([1]) },
        { type: PassImageType.Icon, scale: 2, data: Buffer.from([2]) },
        { type: PassImageType.Icon, scale: 3, data: Buffer.from([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('icon@2x.png')).not.toBeNull();
      expect(zip.file('icon@3x.png')).not.toBeNull();
    });
  });

  describe('Image Filename Generation', () => {
    it('should generate correct filename for 1x scale', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Logo, scale: 1, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();
    });

    it('should generate correct filename for 2x scale', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([1]) },
        { type: PassImageType.Background, scale: 2, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('icon@2x.png')).not.toBeNull();
      expect(zip.file('background@2x.png')).not.toBeNull();
    });

    it('should generate correct filename for 3x scale', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Footer, scale: 3, data: new Uint8Array([1]) },
        { type: PassImageType.Thumbnail, scale: 3, data: new Uint8Array([2]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('footer@3x.png')).not.toBeNull();
      expect(zip.file('thumbnail@3x.png')).not.toBeNull();
    });

    it('should use correct base names from PassImageType enum', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Background, data: new Uint8Array([1]) },
        { type: PassImageType.Footer, data: new Uint8Array([2]) },
        { type: PassImageType.Icon, data: new Uint8Array([3]) },
        { type: PassImageType.Logo, data: new Uint8Array([4]) },
        { type: PassImageType.Strip, data: new Uint8Array([5]) },
        { type: PassImageType.Thumbnail, data: new Uint8Array([6]) },
        { type: PassImageType.PersonalizationLogo, data: new Uint8Array([7]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      expect(zip.file('background.png')).not.toBeNull();
      expect(zip.file('footer.png')).not.toBeNull();
      expect(zip.file('icon.png')).not.toBeNull();
      expect(zip.file('logo.png')).not.toBeNull();
      expect(zip.file('strip.png')).not.toBeNull();
      expect(zip.file('thumbnail.png')).not.toBeNull();
      expect(zip.file('personalizationLogo.png')).not.toBeNull();
    });

    it('should have correct filenames in manifest', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Logo, scale: 3, data: new Uint8Array([3]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toBeDefined();
      expect(manifest['icon@2x.png']).toBeDefined();
      expect(manifest['logo@3x.png']).toBeDefined();
    });
  });

  describe('Manifest Hash Correctness', () => {
    it('should generate unique hashes for different image content', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([1, 2, 3]) },
        { type: PassImageType.Logo, data: new Uint8Array([4, 5, 6]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).not.toBe(manifest['logo.png']);
    });

    it('should generate same hash for identical content', async () => {
      const sameData = new Uint8Array([1, 2, 3, 4, 5]);
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: sameData },
        { type: PassImageType.Logo, data: new Uint8Array([1, 2, 3, 4, 5]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toBe(manifest['logo.png']);
    });

    it('should have valid SHA1 format for all image hashes', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, scale: 1, data: new Uint8Array([1]) },
        { type: PassImageType.Icon, scale: 2, data: new Uint8Array([2]) },
        { type: PassImageType.Logo, data: new Uint8Array([3]) },
        { type: PassImageType.Strip, scale: 3, data: new Uint8Array([4]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const manifestContent = await zip.file('manifest.json')!.async('string');
      const manifest = JSON.parse(manifestContent);

      expect(manifest['icon.png']).toMatch(/^[a-f0-9]{40}$/);
      expect(manifest['icon@2x.png']).toMatch(/^[a-f0-9]{40}$/);
      expect(manifest['logo.png']).toMatch(/^[a-f0-9]{40}$/);
      expect(manifest['strip@3x.png']).toMatch(/^[a-f0-9]{40}$/);
    });
  });

  describe('Edge Cases with Special Data', () => {
    it('should handle image data with null bytes', async () => {
      const dataWithNulls = new Uint8Array([0, 0, 0, 1, 0, 0, 0]);
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: dataWithNulls },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const content = await zip.file('icon.png')!.async('uint8array');
      expect(content).toEqual(dataWithNulls);
    });

    it('should handle image data with all 255 bytes', async () => {
      const maxBytes = new Uint8Array([255, 255, 255, 255]);
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: maxBytes },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const content = await zip.file('icon.png')!.async('uint8array');
      expect(content).toEqual(maxBytes);
    });

    it('should handle binary PNG data correctly', async () => {
      // Minimal valid PNG header
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // IHDR
      ]);

      const images: PassImage[] = [
        { type: PassImageType.Icon, data: pngData },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const content = await zip.file('icon.png')!.async('uint8array');
      expect(content).toEqual(pngData);
    });

    it('should handle single byte image data', async () => {
      const images: PassImage[] = [
        { type: PassImageType.Icon, data: new Uint8Array([42]) },
      ];

      const pass = createPass(minimalPassData, images);
      const buffer = await pass.generate({ skipSignature: true });

      const zip = await JSZip.loadAsync(buffer);
      const content = await zip.file('icon.png')!.async('uint8array');
      expect(content.length).toBe(1);
      expect(content[0]).toBe(42);
    });
  });

  describe('Image Order Independence', () => {
    it('should produce same result regardless of image order', async () => {
      const iconData = new Uint8Array([1, 2, 3]);
      const logoData = new Uint8Array([4, 5, 6]);

      const images1: PassImage[] = [
        { type: PassImageType.Icon, data: iconData },
        { type: PassImageType.Logo, data: logoData },
      ];

      const images2: PassImage[] = [
        { type: PassImageType.Logo, data: logoData },
        { type: PassImageType.Icon, data: iconData },
      ];

      const pass1 = createPass(minimalPassData, images1);
      const pass2 = createPass(minimalPassData, images2);

      const buffer1 = await pass1.generate({ skipSignature: true });
      const buffer2 = await pass2.generate({ skipSignature: true });

      const zip1 = await JSZip.loadAsync(buffer1);
      const zip2 = await JSZip.loadAsync(buffer2);

      // Verify same content
      const icon1 = await zip1.file('icon.png')!.async('uint8array');
      const icon2 = await zip2.file('icon.png')!.async('uint8array');
      expect(icon1).toEqual(icon2);

      const logo1 = await zip1.file('logo.png')!.async('uint8array');
      const logo2 = await zip2.file('logo.png')!.async('uint8array');
      expect(logo1).toEqual(logo2);
    });
  });
});
