export interface CertificateError {
  code: string;
  message: string;
  originalError?: Error;
}

export const handleCertificateError = (error: Error): CertificateError | Error => {
  // Check if this is a certificate error
  if (
    'code' in error && (error as any).code === 'CERT_NOT_TRUSTED' ||
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

export const openCertificateAcceptPage = (): void => {
  // Open the API endpoint in a new tab so user can accept the certificate
  window.open('https://127.0.0.1:27124/', '_blank');
};