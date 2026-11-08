import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      return await new Promise<{ url: string; publicId: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'stores/logos',
              resource_type: 'image',
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Upload failed'));
              }

              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            },
          );

          stream.end(file.buffer);
        },
      );
    } catch (error) {
      this.logger.error('Cloudinary upload failed', error);

      throw new InternalServerErrorException('آپلود تصویر با مشکل مواجه شد.');
    }
  }

  async removeImage(publicId: string) {
    try {
      return await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
    } catch (error) {
      this.logger.error('Cloudinary image deletion failed', error);

      throw new InternalServerErrorException('حذف تصویر با مشکل مواجه شد.');
    }
  }
}
