// @/services/paystack.ts

/**
 * Load the Paystack inline script
 * @param onLoad Callback function to run when script is loaded
 * @returns Promise that resolves when script is loaded
 */
export const loadPaystack = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Paystack is already loaded
      if (window.PaystackPop) {
        resolve();
        return;
      }
  
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      // Set up event handlers
      script.onload = () => {
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'));
      };
      
      // Add script to document
      document.body.appendChild(script);
    });
  };
  
  /**
   * Verify a Paystack transaction
   * @param reference The transaction reference to verify
   * @param secretKey Your Paystack secret key
   * @returns Promise with transaction verification result
   */
  export const verifyTransaction = async (reference: string, secretKey: string): Promise<any> => {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify transaction');
      }
      
      return data;
    } catch (error) {
      console.error('Transaction verification error:', error);
      throw error;
    }
  };