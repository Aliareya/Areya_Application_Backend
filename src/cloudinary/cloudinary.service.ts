import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name:'agtdlqwi',
      api_key: '552468484797824',
      api_secret: 'x0-exs23JaC4VJlYWn88kHnKyKM',
    });
  }

  async uploadFile(file: Express.Multer.File) {
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'stores/logos' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  async removeImage(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  async updateImage(file: Express.Multer.File, oldPublicId?: string) {
    if (oldPublicId) {
      await this.removeImage(oldPublicId);
    }
    return this.uploadFile(file);
  }

  async uploadMultiple(files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}