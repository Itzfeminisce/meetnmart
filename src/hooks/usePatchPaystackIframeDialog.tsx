import { useEffect } from 'react';

export const usePatchPaystackIframeDialog = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const paystackIframe = document.querySelector('iframe[src*="paystack"]');
      const modal = document.querySelector('[data-radix-dialog-content]');
      if (paystackIframe && modal) {
        // Allow iframe to receive pointer events
        (paystackIframe as HTMLElement).style.pointerEvents = 'auto';

        // Disable pointer events on overlay to avoid blocking iframe
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        overlays.forEach((overlay) => {
          (overlay as HTMLElement).style.pointerEvents = 'none';
        });

        // Ensure modal itself allows interaction
        (modal as HTMLElement).style.pointerEvents = 'auto';
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
};
