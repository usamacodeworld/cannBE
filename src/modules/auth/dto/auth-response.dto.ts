import { UserResponseDto } from "../../user/dto/user-response.dto";

export class AuthResponseDto {
  // token: string;
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
