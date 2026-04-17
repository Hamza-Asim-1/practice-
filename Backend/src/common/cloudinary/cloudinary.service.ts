import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryResponse } from './cloudinary-response.js';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'teza_products',
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'png', 'jpeg'],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result as CloudinaryResponse);
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadFromUrl(url: string): Promise<CloudinaryResponse> {
        try {
            const result = await cloudinary.uploader.upload(url, {
                folder: 'teza_products',
                resource_type: 'image',
                allowed_formats: ['jpg', 'png', 'jpeg'],
            });
            return result as CloudinaryResponse;
        } catch (error) {
            throw error;
        }
    }
}
