import { Injectable } from '@nestjs/common';
import { InMemoryProfileRepository } from './profile.in-memory.repository.js';

/**
 * Production repository adapter for Profile.
 *
 * Currently stores data in memory; the adapter seam exists so a persistent
 * database implementation can be swapped in later without changing consumers.
 */
@Injectable()
export class ProfileRepositoryAdapter extends InMemoryProfileRepository {}
