import { Processor } from './src/processor';
import fs from "fs";

const main = () => {
    const files = fs.readdirSync("./assets/resized", { withFileTypes: true });
    const imagesDBName = new Date().getTime() + '.csv';

    fs.openSync('./' + imagesDBName, 'w');
    const fw = fs.createWriteStream(imagesDBName, { flags: 'a' });

    fw.write('file_name, red_mean, green_mean, blue_mean, grayscale_mean, variance, std_deviation\n');

    files.filter(file => !file.isDirectory());

    const pcr = new Processor();

    const images = files.map(file => file.name).map((file) => {
        return {
            'name': file,
            'image': pcr.readImage('./assets/resized/' + file),
            'red_mean': 0,
            'green_mean': 0,
            'blue_mean': 0,
            'grayscale_mean': 0,
            'variance': 0,
            'std_deviation': 0
        };
    });
    
    images.forEach(async imageData => {
        const image = await imageData.image;
        const imageBW = image.clone().grayscale();

        let red = 0;
        let green = 0;
        let blue = 0;
        let grayscale = 0;
        let pixelCount = 0;
    
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            red += pcr.normalizeValue(image.bitmap.data[idx]);
            green += pcr.normalizeValue(image.bitmap.data[idx + 1]);
            blue += pcr.normalizeValue(image.bitmap.data[idx + 2]);
            grayscale += pcr.normalizeValue(imageBW.bitmap.data[idx]);
    
            pixelCount++;
        });
    
        imageData.red_mean = red / pixelCount;
        imageData.green_mean = green / pixelCount;
        imageData.blue_mean = blue / pixelCount;
        imageData.grayscale_mean = grayscale / pixelCount;

        imageData.variance = imageBW.bitmap.data.reduce((pre, curr) => {
            return pre + Math.pow((pcr.normalizeValue(curr) - imageData.grayscale_mean), 2); 
        }, 0) / pixelCount;

        imageData.std_deviation = Math.sqrt(imageData.variance);

        console.log(`${imageData.red_mean}, ${imageData.blue_mean}, ${imageData.green_mean}, ${imageData.grayscale_mean}, ${imageData.variance}, ${imageData.std_deviation} `);

        fw.write(`${imageData.name}, ${imageData.red_mean}, ${imageData.blue_mean}, ${imageData.green_mean}, ${imageData.grayscale_mean}, ${imageData.variance}, ${imageData.std_deviation}\n`);

    });
};

main();
