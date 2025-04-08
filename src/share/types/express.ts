import 'express-session'
import { type SessionMetadata } from '@/src/share/types/session_metada';

declare module  'express-session'{
  interface SessionData {
    userid?: string,
    createdAt?: Date|string,
    metadata:SessionMetadata

  }
}
