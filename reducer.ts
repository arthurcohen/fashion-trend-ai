import { Processor } from './src/processor';
import fs from "fs";

let resize = () => {
    const filenames = fs.readdirSync("./assets", { withFileTypes: true });

    const pcr = new Processor();

    const images = filenames.filter(file => !file.isDirectory()).map((file) => {
        return {
            'name': file.name,
            'image': pcr.readImage('./assets/' + file.name)
        }
    });

    images.forEach(async imageData => {
        const img = await imageData.image;

        console.log('processing image', imageData.name);

        img.resize(64, 64).quality(50).write('./assets/resized/' + imageData.name.split('\.')[0] + '_64.' + img.getExtension());
    });

    console.log(`Processing ${images.length} images`);
};

resize();
