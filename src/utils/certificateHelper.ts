/**
 * Helper functions for handling certificate issues with Obsidian's self-signed certificates
 */

import { ConnectionError } from '@/types/obsidian';

/**
 * Check if an error is a certificate-related error and format it
 * @param error The error to check
 * @returns Formatted certificate error or the original error
 */
export const handleCertificateError = (error: any): ConnectionError | Error => {
  // Check if this is a certificate error
  if (
    ('code' in error && (error as any).code === 'CERT_NOT_TRUSTED') ||
    error.message.includes('certificate') ||
    error.message.includes('SSL')
  ) {
    // Format for display to user
    return {
      code: 'CERT_ERROR',
      message: 'Certificate error detected. Please accept the self-signed certificate in your browser.',
      originalError: error
    };
  }
  
  return error;
};

/**
 * Open the API endpoint in a new browser tab to accept the certificate
 * @param host Host address (defaults to 127.0.0.1)
 * @param port Port number (defaults to 27124)
 */
export const openCertificateAcceptPage = (host: string = '127.0.0.1', port: string = '27124'): void => {
  // Open the API endpoint in a new tab so user can accept the certificate
  window.open(`https://${host}:${port}/`, '_blank');
};