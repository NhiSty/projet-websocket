import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Service for hashing and verifying values using Argon2 algorithm.
 */
@Injectable()
export class HashService {
  /**
   * Hashes a given value using Argon2 algorithm.
   * @param value - The value to be hashed.
   * @returns The hashed value.
   */
  public async hash(value: string): Promise<string> {
    return await argon2.hash(value);
  }

  /**
   * Verifies if a given value matches a given hash using Argon2 algorithm.
   * @param value - The value to be verified.
   * @param hash - The hash to be compared against.
   * @returns A boolean indicating if the value matches the hash.
   */
  public async verify(value: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, value);
  }
}
