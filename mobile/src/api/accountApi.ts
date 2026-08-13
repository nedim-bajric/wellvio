import { apiClient } from './client';

const ACCOUNT_PATH = '/account';

export const accountApi = {
  delete: () => apiClient.delete(ACCOUNT_PATH) as Promise<void>,
};
