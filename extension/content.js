// Regular expressions for OTP detection
const OTP_PATTERNS = {
    // Match 4-8 digit codes
    NUMERIC: /\b\d{4,8}\b/,
    // Match common OTP message patterns
    SMS: /(?:OTP|code|verification code|security code|authentication code|verify)[^\d]*(\d{4,8})/i
};

// Function to extract OTP from text
function extractOTP(text) {
    // Try SMS pattern first
    const smsMatch = text.match(OTP_PATTERNS.SMS);
    if (smsMatch && smsMatch[1]) {
        return {
            otp: smsMatch[1],
            source: 'SMS Pattern'
        };
    }

    // Fallback to numeric pattern
    const numericMatch = text.match(OTP_PATTERNS.NUMERIC);
    if (numericMatch) {
        return {
            otp: numericMatch[0],
            source: 'Numeric Pattern'
        };
    }

    return null;
}

// Function to handle mutations in the DOM
function handleMutations(mutations) {
    chrome.storage.local.get(['isActive'], function(result) {
        if (!result.isActive) return;

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                    const text = node.textContent || node.innerText;
                    const result = extractOTP(text);
                    
                    if (result) {
                        // Send OTP to popup
                        chrome.runtime.sendMessage({
                            type: 'OTP_DETECTED',
                            otp: result.otp,
                            source: result.source + ' - ' + window.location.hostname
                        });

                        // Auto-fill if there's an input field
                        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"]');
                        inputs.forEach(input => {
                            if (input.value === '' && 
                                (input.placeholder.toLowerCase().includes('otp') || 
                                 input.name.toLowerCase().includes('otp') ||
                                 input.id.toLowerCase().includes('otp'))) {
                                input.value = result.otp;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        });
                    }
                }
            });
        });
    });
}

// Create and start the mutation observer
const observer = new MutationObserver(handleMutations);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Also check for OTP in initial page load
document.addEventListener('DOMContentLoaded', function() {
    const text = document.body.textContent;
    const result = extractOTP(text);
    
    if (result) {
        chrome.runtime.sendMessage({
            type: 'OTP_DETECTED',
            otp: result.otp,
            source: result.source + ' - ' + window.location.hostname
        });
    }
});