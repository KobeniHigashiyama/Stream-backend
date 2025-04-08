import type { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';


import DeviceDetector = require('device-detector-js');
import { IS_DEV } from '@/src/share/utils/is_dev';
import { SessionMetadata } from '@/src/share/types/session_metada';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getSessionMetadata(
  req: Request,
  userAgent: string
): SessionMetadata {
  const ip = IS_DEV
    ? '173.166.164.121'
    : Array.isArray(req.headers['cf-connecting-ip'])
      ? req.headers['cf-connecting-ip'][0]
      : req.headers['cf-connecting-ip'] ||
      (typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0]
        : req.ip);

  const location = lookup(ip) || { country: null, city: null, ll: [0, 0] };
  const device = new DeviceDetector().parse(userAgent);

  return {
    location: {
      country: location.country
        ? countries.getName(location.country, 'en') || 'Неизвестно'
        : 'Неизвестно',
      city: location.city || 'Неизвестно',
      latitude: location.ll[0] || 0,
      longitude: location.ll[1] || 0,
    },
    deviceInfo: {
      browser: device.client?.name || 'Неизвестно',
      os: device.os?.name || 'Неизвестно',
      type: device.device?.type || 'Неизвестно',
    },
    ip,
  };
}
