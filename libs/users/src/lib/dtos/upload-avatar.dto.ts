import { IsNotEmpty, IsString } from 'class-validator';

export class UploadAvatarDTO {
	@IsString()
	@IsNotEmpty()
	image: string;
}
