const sizeOf = require('image-size');

function getImageDimensions(imagePath) {
    try {
        const dimensions = sizeOf(imagePath);
        console.log(`Width: ${dimensions.width}, Height: ${dimensions.height}`);
        return { width: dimensions.width, height: dimensions.height };
    } catch (error) {
        console.error('Error reading image:', error);
    }
}

module.exports = { getImageDimensions };