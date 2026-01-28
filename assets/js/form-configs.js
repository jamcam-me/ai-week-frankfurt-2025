/**
 * BRI Custom Form Configurations
 * GDPR-compliant form definitions for event landing pages
 *
 * 🪨🏔️  Authored by BRI | ⚡ Powered by Claude Code
 */

const BRI_FORM_CONFIGS = {
  /**
   * Form 1: Floating Banner CTA
   * Multi-field form for high-intent leads
   */
  floatingBanner: {
    formConfig: {
      formGuid: 'bri-floating-banner-cta',
      name: 'Event Landing - Floating Banner CTA'
    },
    eventName: 'AI Week Frankfurt 2025', // Override per event
    fields: [
      {
        type: 'email',
        name: 'email',
        label: 'Email Address',
        placeholder: 'your@company.com',
        required: true,
        autocomplete: 'email'
      },
      {
        type: 'text',
        name: 'company',
        label: 'Company',
        placeholder: 'Your organization',
        required: false,
        autocomplete: 'organization'
      },
      {
        type: 'select',
        name: 'interest_area',
        label: 'Primary Interest',
        required: true,
        options: [
          { label: 'AI Governance', value: 'ai_governance' },
          { label: 'AI Operations Platform', value: 'ai_operations' },
          { label: 'EU AI Act Compliance', value: 'eu_ai_act' },
          { label: 'Security & Risk Management', value: 'security_risk' },
          { label: 'Grant Funding', value: 'grant_funding' }
        ]
      },
      {
        type: 'hidden',
        name: 'cta_interaction_type',
        value: 'floating_banner'
      }
    ],
    buttonText: 'Get Framework',
    buttonColor: '#dab86e', // BRI gold-700
    successMessage: `
      <h3 style="margin: 0 0 0.5rem 0;">Thank you!</h3>
      <p style="margin: 0;">We'll send our AI governance framework within 24 hours.</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Questions? <a href="mailto:james@bigrock-intel.ai">james@bigrock-intel.ai</a></p>
    `,
    onSuccess: (data, response) => {
      console.log('Floating Banner CTA submitted:', data);
      // Track conversion
      if (window.gtag) {
        gtag('event', 'form_submit', {
          form_name: 'floating_banner_cta',
          event_category: 'engagement'
        });
      }
    }
  },

  /**
   * Form 2: Quick Email Capture
   * Minimal friction email-only form
   */
  quickEmail: {
    formConfig: {
      formGuid: 'bri-quick-email-capture',
      name: 'Event Landing - Quick Email Capture'
    },
    eventName: 'AI Week Frankfurt 2025', // Override per event
    fields: [
      {
        type: 'email',
        name: 'email',
        label: 'Email Address',
        placeholder: 'your@company.com',
        required: true,
        autocomplete: 'email'
      },
      {
        type: 'hidden',
        name: 'cta_interaction_type',
        value: 'in_section_cta'
      }
    ],
    buttonText: 'Send Checklist',
    buttonColor: '#5d9182', // BRI green-400
    successMessage: `
      <h3 style="margin: 0 0 0.5rem 0;">Check your inbox!</h3>
      <p style="margin: 0;">Your AI readiness checklist is on its way.</p>
    `,
    onSuccess: (data, response) => {
      console.log('Quick Email Capture submitted:', data);
      // Track conversion
      if (window.gtag) {
        gtag('event', 'form_submit', {
          form_name: 'quick_email_capture',
          event_category: 'engagement'
        });
      }
    }
  },

  /**
   * Form 3: Exit Intent Popup
   * Last-chance lead capture with download incentive
   */
  exitIntent: {
    formConfig: {
      formGuid: 'bri-exit-intent-popup',
      name: 'Event Landing - Exit Intent'
    },
    eventName: 'AI Week Frankfurt 2025', // Override per event
    fields: [
      {
        type: 'email',
        name: 'email',
        label: 'Email Address',
        placeholder: 'your@company.com',
        required: true,
        autocomplete: 'email'
      },
      {
        type: 'hidden',
        name: 'cta_interaction_type',
        value: 'exit_intent'
      }
    ],
    buttonText: 'Download Now',
    buttonColor: '#dab86e', // BRI gold-700
    successMessage: `
      <h3 style="margin: 0 0 0.5rem 0;">Download starting...</h3>
      <p style="margin: 0;">Check your email for the download link!</p>
    `,
    onSuccess: (data, response) => {
      console.log('Exit Intent submitted:', data);

      // Trigger PDF download
      const pdfUrl = window.BRI_EXIT_INTENT_PDF_URL || 'https://bigrock-intel.ai/downloads/eu-ai-act-compliance-guide.pdf';
      setTimeout(() => {
        window.open(pdfUrl, '_blank');
      }, 1000);

      // Track conversion
      if (window.gtag) {
        gtag('event', 'form_submit', {
          form_name: 'exit_intent_popup',
          event_category: 'engagement'
        });
      }
    }
  }
};

// Expose to global scope
if (typeof window !== 'undefined') {
  window.BRI_FORM_CONFIGS = BRI_FORM_CONFIGS;
}
