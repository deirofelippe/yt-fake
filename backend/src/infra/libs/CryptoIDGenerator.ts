import { randomUUID } from 'crypto';
import { IDGenerator } from '../../domain/libs/IDGenerator';

export class CryptoIDGenerator implements IDGenerator {
  generate(): string {
    return randomUUID();
  }
}
