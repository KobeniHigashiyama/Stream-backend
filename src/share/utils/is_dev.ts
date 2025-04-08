import * as dotenv from "dotenv";
import { ConfigService } from '@nestjs/config';

dotenv.config();
export function isDev(configSrevice:ConfigService) {
  return configSrevice.getOrThrow<string>("NODE_ENV") === "development";
}
export const IS_DEV = process.env.NODE_ENV !== "development";