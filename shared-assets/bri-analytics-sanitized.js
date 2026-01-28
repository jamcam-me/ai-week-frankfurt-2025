/**
 * Event Landing Page Analytics Library
 *
 * GDPR-Compliant behavioral tracking for event landing pages
 * Requires user consent for full tracking capabilities
 *
 * Features:
 * - QR code detection
 * - Section engagement tracking
 * - CTA click tracking
 * - Form submission tracking
 * - Vercel Analytics custom events
 * - HubSpot integration (with consent)
 *
 * Usage:
 *   <body data-analytics-campaign="AI_Week_Frankfurt_2025">
 *   <script defer src="./shared-assets/bri-analytics-sanitized.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        sectionVisibilityThreshold: 0.5, // 50% visible
        sectionEngagementTime: 2000, // 2 seconds
        debug: false, // Console logging disabled in production
        requireConsent: true // Require consent for HubSpot tracking
    };

    // State
    const state = {
        analyticsId: null,
        isQR: false,
        utmParams: {},
        trackedSections: new Set(),
        sectionTimers: new Map()
    };

    /**
     * Debug logger (disabled in production)
     */
    function log(...args) {
        if (CONFIG.debug) {
            // Silent logging - no identifying markers
            console.log(...args);
        }
    }

    /**
     * Check if user has given consent for tracking
     */
    function hasUserConsent() {
        // Check for consent cookie or localStorage
        const consentCookie = document.cookie.split(';').find(c => c.trim().startsWith('analytics-consent='));
        const localConsent = localStorage.getItem('analytics-consent');

        return consentCookie?.includes('true') || localConsent === 'true';
    }

    /**
     * Sanitize URL to remove potentially sensitive parameters
     */
    function sanitizeURL(url) {
        try {
            const urlObj = new URL(url);
            // Only return pathname, no query parameters that might contain PII
            return urlObj.pathname;
        } catch {
            return '/';
        }
    }

    /**
     * Extract UTM parameters from URL
     */
    function getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || null,
            medium: params.get('utm_medium') || null,
            campaign: params.get('utm_campaign') || null,
            content: params.get('utm_content') || null,
            term: params.get('utm_term') || null
        };
    }

    /**
     * Check if visitor arrived via QR code
     */
    function detectQRScan() {
        const params = new URLSearchParams(window.location.search);
        return params.get('utm_medium') === 'qr';
    }

    /**
     * Get campaign context
     */
    function getCampaignContext() {
        return {
            analyticsId: state.analyticsId,
            isQR: state.isQR,
            ...state.utmParams
        };
    }

    /**
     * Send custom event to Vercel Analytics
     */
    function sendVercelEvent(eventName, properties = {}) {
        if (typeof window.va === 'function') {
            window.va('track', eventName, {
                ...properties,
                analytics_id: state.analyticsId,
                is_qr: state.isQR,
                ...state.utmParams
            });
            log('Vercel event sent:', eventName, properties);
        } else {
            log('Vercel Analytics not available');
        }
    }

    /**
     * Send behavioral event to HubSpot (only with consent)
     */
    function sendHubSpotEvent(eventName, properties = {}) {
        // Only send to HubSpot if user has given consent
        if (!hasUserConsent()) {
            log('HubSpot tracking skipped - no consent');
            return;
        }

        if (typeof window._hsq !== 'undefined') {
            window._hsq.push(['trackCustomBehavioralEvent', {
                name: eventName,
                properties: {
                    ...properties,
                    analytics_id: state.analyticsId,
                    is_qr: state.isQR,
                    campaign: state.utmParams.campaign,
                    source: state.utmParams.source,
                    medium: state.utmParams.medium
                }
            }]);
            log('HubSpot event sent:', eventName, properties);
        } else {
            log('HubSpot tracking not available');
        }
    }

    /**
     * Track QR code landing
     */
    function trackQRLanding() {
        if (state.isQR) {
            sendVercelEvent('qr_scan_landing', {
                campaign: state.utmParams.campaign || 'unknown',
                source: state.utmParams.source || 'unknown'
            });

            sendHubSpotEvent('QR Code Scan', {
                event_type: 'qr_landing',
                campaign: state.utmParams.campaign || 'unknown',
                source: state.utmParams.source || 'unknown',
                landing_page: state.analyticsId
            });

            log('QR landing tracked');
        }
    }

    /**
     * Track page view
     */
    function trackPageView() {
        // Use sanitized URLs to protect PII
        const sanitizedPath = sanitizeURL(window.location.href);
        const sanitizedReferrer = document.referrer ? sanitizeURL(document.referrer) : 'direct';

        sendVercelEvent('page_view', {
            page: sanitizedPath,
            title: document.title
        });

        sendHubSpotEvent('Landing Page View', {
            event_type: 'page_view',
            page_url: sanitizedPath,
            page_title: document.title,
            referrer: sanitizedReferrer
        });

        log('Page view tracked');
    }

    /**
     * Track section engagement
     */
    function trackSectionEngagement(sectionId, sectionName) {
        if (state.trackedSections.has(sectionId)) {
            return; // Already tracked
        }

        state.trackedSections.add(sectionId);

        sendVercelEvent('section_engagement', {
            section_id: sectionId,
            section_name: sectionName,
            time_to_view: Math.round((Date.now() - state.pageLoadTime) / 1000)
        });

        sendHubSpotEvent('Section Engagement', {
            event_type: 'section_engagement',
            section_id: sectionId,
            section_name: sectionName,
            engagement_threshold: `${CONFIG.sectionVisibilityThreshold * 100}% visible for ${CONFIG.sectionEngagementTime / 1000}s`
        });

        log('Section engagement tracked:', sectionName);
    }

    /**
     * Track CTA click
     */
    function trackCTAClick(ctaId, ctaType) {
        sendVercelEvent('cta_conversion', {
            cta_id: ctaId,
            cta_type: ctaType
        });

        sendHubSpotEvent('CTA Click', {
            event_type: 'cta_click',
            cta_id: ctaId,
            cta_type: ctaType,
            cta_location: 'landing_page'
        });

        log('CTA click tracked:', ctaId);
    }

    /**
     * Track form submission
     */
    function trackFormSubmit(formType) {
        sendVercelEvent('form_submission', {
            form_type: formType
        });

        sendHubSpotEvent('Form Submission', {
            event_type: 'form_submission',
            form_type: formType,
            conversion_type: 'lead_capture'
        });

        log('Form submission tracked:', formType);
    }

    /**
     * Setup Intersection Observer for section tracking
     */
    function setupSectionObserver() {
        const sections = document.querySelectorAll('[data-track-section]');

        if (sections.length === 0) {
            log('No sections found with data-track-section attribute');
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('data-track-section');
                const sectionName = entry.target.id || sectionId;

                if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.sectionVisibilityThreshold) {
                    // Section is visible - start timer
                    if (!state.sectionTimers.has(sectionId)) {
                        const timer = setTimeout(() => {
                            trackSectionEngagement(sectionId, sectionName);
                            state.sectionTimers.delete(sectionId);
                        }, CONFIG.sectionEngagementTime);

                        state.sectionTimers.set(sectionId, timer);
                        log('Section visibility timer started:', sectionName);
                    }
                } else {
                    // Section no longer visible - clear timer
                    if (state.sectionTimers.has(sectionId)) {
                        clearTimeout(state.sectionTimers.get(sectionId));
                        state.sectionTimers.delete(sectionId);
                        log('Section visibility timer cancelled:', sectionName);
                    }
                }
            });
        }, {
            threshold: CONFIG.sectionVisibilityThreshold
        });

        sections.forEach(section => observer.observe(section));
        log('Section observer setup complete:', sections.length, 'sections');
    }

    /**
     * Setup CTA click tracking
     */
    function setupCTATracking() {
        const ctas = document.querySelectorAll('[data-track-cta]');

        if (ctas.length === 0) {
            log('No CTAs found with data-track-cta attribute');
            return;
        }

        ctas.forEach(cta => {
            const ctaId = cta.getAttribute('data-track-cta');
            const ctaType = cta.tagName === 'A' ? 'link' : 'button';

            cta.addEventListener('click', function() {
                trackCTAClick(ctaId, ctaType);
            });
        });

        log('CTA tracking setup complete:', ctas.length, 'CTAs');
    }

    /**
     * Setup form submission tracking
     */
    function setupFormTracking() {
        const forms = document.querySelectorAll('form');

        if (forms.length === 0) {
            log('No forms found');
            return;
        }

        forms.forEach(form => {
            form.addEventListener('submit', function() {
                const formType = form.getAttribute('data-form-type') || 'contact';
                trackFormSubmit(formType);
            });
        });

        log('Form tracking setup complete:', forms.length, 'forms');
    }

    /**
     * Initialize analytics
     */
    function init() {
        // Get analytics campaign ID from body tag
        state.analyticsId = document.body.getAttribute('data-analytics-campaign');

        if (!state.analyticsId) {
            // Silent fail - no error messages that expose implementation
            return;
        }

        // Check consent status
        const hasConsent = hasUserConsent();
        if (!hasConsent && CONFIG.requireConsent) {
            log('Analytics initialized in limited mode - no consent for full tracking');
        }

        // Extract UTM parameters
        state.utmParams = getUTMParams();
        state.isQR = detectQRScan();
        state.pageLoadTime = Date.now();

        log('Initializing analytics...');
        log('Analytics ID:', state.analyticsId);
        log('Is QR scan:', state.isQR);
        log('UTM params:', state.utmParams);

        // Track initial events
        trackPageView();
        trackQRLanding();

        // Setup observers and event listeners
        setupSectionObserver();
        setupCTATracking();
        setupFormTracking();

        log('Analytics initialized successfully');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for manual access if needed (anonymized)
    window.EventAnalytics = {
        trackCTAClick,
        trackFormSubmit,
        trackSectionEngagement,
        getCampaignContext,
        setConsent: (value) => {
            localStorage.setItem('analytics-consent', value ? 'true' : 'false');
            if (value) {
                init(); // Re-initialize with consent
            }
        }
    };

})();
