import Jimp from "jimp";

export class Processor {
    async readImage(imagePath: string) {
        const image = await Jimp.read(imagePath);

        return image;
    }

    normalizeValue = (value) => value / 255;
}
