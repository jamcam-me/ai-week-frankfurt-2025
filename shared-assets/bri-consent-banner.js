/**
 * GDPR Consent Banner for BRI Event Landing Pages
 *
 * Lightweight consent management for analytics tracking
 * Sets cookie/localStorage for user preference persistence
 *
 */

(function() {
    'use strict';

    // Check if consent has already been given or denied
    function hasExistingConsent() {
        const consentCookie = document.cookie.split(';').find(c => c.trim().startsWith('analytics-consent='));
        const localConsent = localStorage.getItem('analytics-consent');
        return consentCookie || localConsent !== null;
    }

    // Set consent preference
    function setConsent(value) {
        // Set cookie (30 days)
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `analytics-consent=${value}; expires=${date.toUTCString()}; path=/`;

        // Also set localStorage as backup
        localStorage.setItem('analytics-consent', value);

        // Trigger analytics re-initialization if consent granted
        if (value === 'true' && window.EventAnalytics) {
            window.EventAnalytics.setConsent(true);
        }
    }

    // Create and show consent banner
    function showConsentBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.innerHTML = `
            <style>
                #consent-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: white;
                    padding: 20px;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                #consent-banner .consent-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                #consent-banner .consent-text {
                    flex: 1;
                    min-width: 300px;
                    font-size: 14px;
                    line-height: 1.5;
                }

                #consent-banner .consent-buttons {
                    display: flex;
                    gap: 10px;
                }

                #consent-banner button {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                #consent-banner .accept-btn {
                    background: #00c853;
                    color: white;
                }

                #consent-banner .accept-btn:hover {
                    background: #00a844;
                    transform: translateY(-1px);
                }

                #consent-banner .reject-btn {
                    background: transparent;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                }

                #consent-banner .reject-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                @media (max-width: 768px) {
                    #consent-banner .consent-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    #consent-banner .consent-buttons {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
            <div class="consent-content">
                <div class="consent-text">
                    We use cookies and analytics to improve your experience and measure event engagement.
                    This includes sharing data with HubSpot for better event insights.
                    Your privacy is important to us.
                </div>
                <div class="consent-buttons">
                    <button class="reject-btn" onclick="window.handleConsentChoice(false)">Reject</button>
                    <button class="accept-btn" onclick="window.handleConsentChoice(true)">Accept Analytics</button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(banner);
    }

    // Handle consent choice
    window.handleConsentChoice = function(accepted) {
        setConsent(accepted ? 'true' : 'false');

        // Remove banner with animation
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }

        // Log choice for debugging (will be silent in production)
        if (window.EventAnalytics && window.EventAnalytics.getCampaignContext) {
            console.log('Consent choice:', accepted ? 'Accepted' : 'Rejected');
        }
    };

    // Initialize on DOM ready
    function init() {
        // Only show banner if no existing consent
        if (!hasExistingConsent()) {
            // Small delay to ensure page has loaded
            setTimeout(showConsentBanner, 1000);
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();