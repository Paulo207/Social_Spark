/**
 * Utility to process images for social media platforms,
 * specifically handling aspect ratio requirements for Instagram.
 */

export interface ImageProcessingResult {
    file: File;
    dataUrl: string;
    width: number;
    height: number;
    aspectRatio: number;
}

export const MIN_IG_RATIO = 0.8; // 4:5
export const MAX_IG_RATIO = 1.91; // 1.91:1

export const calculateAspectRatio = (width: number, height: number): number => {
    return width / height;
};

export const isAspectRatioValid = (ratio: number): boolean => {
    return ratio >= MIN_IG_RATIO && ratio <= MAX_IG_RATIO;
};

/**
 * Automatically adjusts an image to fit Instagram's aspect ratio requirements
 * by adding padding (letterboxing) to ensure the image is neither too tall nor too wide.
 */
export const adaptImageForInstagram = async (file: File): Promise<ImageProcessingResult> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalRatio = originalWidth / originalHeight;

            let targetWidth = originalWidth;
            let targetHeight = originalHeight;

            // Determine if we need to adjust
            if (originalRatio < MIN_IG_RATIO) {
                // Too tall - need to add width (padding on sides)
                targetWidth = originalHeight * MIN_IG_RATIO;
            } else if (originalRatio > MAX_IG_RATIO) {
                // Too wide - need to add height (padding on top/bottom)
                targetHeight = originalWidth / MAX_IG_RATIO;
            } else {
                // Already valid, just resolve the original
                resolve({
                    file,
                    dataUrl: img.src,
                    width: originalWidth,
                    height: originalHeight,
                    aspectRatio: originalRatio
                });
                return;
            }

            // Create canvas for processing
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Fill background with white (classic Instagram look)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Draw image centered
            const x = (targetWidth - originalWidth) / 2;
            const y = (targetHeight - originalHeight) / 2;
            ctx.drawImage(img, x, y, originalWidth, originalHeight);

            // Convert back to file
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas to Blob failed'));
                    return;
                }

                const processedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                resolve({
                    file: processedFile,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
                    width: targetWidth,
                    height: targetHeight,
                    aspectRatio: targetWidth / targetHeight
                });
            }, 'image/jpeg', 0.9);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.readAsDataURL(file);
    });
};

/**
 * Helper to get image dimensions and ratio
 */
export const getImageInfo = async (file: File): Promise<{ width: number, height: number, ratio: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height,
                ratio: img.width / img.height
            });
        };
        img.onerror = reject;
        reader.readAsDataURL(file);
    });
};
