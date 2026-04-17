import type { CloudinaryResponse } from './cloudinary-response.js';
export declare class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse>;
    uploadFromUrl(url: string): Promise<CloudinaryResponse>;
}
