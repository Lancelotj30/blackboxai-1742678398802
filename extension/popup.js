document.addEventListener('DOMContentLoaded', function() {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const toggleButton = document.getElementById('toggleButton');
  const lastOtpElement = document.getElementById('last-otp');
  const otpSourceElement = document.getElementById('otp-source');

  // Get initial state
  chrome.storage.local.get(['isActive', 'lastOtp', 'otpSource'], function(result) {
    updateUI(result.isActive || false);
    if (result.lastOtp) {
      lastOtpElement.textContent = result.lastOtp;
      otpSourceElement.textContent = result.otpSource || 'Unknown source';
    }
  });

  // Toggle button click handler
  toggleButton.addEventListener('click', function() {
    chrome.storage.local.get(['isActive'], function(result) {
      const newState = !result.isActive;
      chrome.storage.local.set({ isActive: newState });
      updateUI(newState);
    });
  });

  // Listen for OTP updates from content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'OTP_DETECTED') {
      lastOtpElement.textContent = request.otp;
      otpSourceElement.textContent = request.source;
      
      // Store the latest OTP
      chrome.storage.local.set({
        lastOtp: request.otp,
        otpSource: request.source
      });
    }
  });

  function updateUI(isActive) {
    if (isActive) {
      statusIndicator.classList.remove('bg-red-500');
      statusIndicator.classList.add('bg-green-500');
      statusText.textContent = 'Active';
      toggleButton.textContent = 'Stop Intercepting';
      toggleButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      toggleButton.classList.add('bg-red-600', 'hover:bg-red-700');
    } else {
      statusIndicator.classList.remove('bg-green-500');
      statusIndicator.classList.add('bg-red-500');
      statusText.textContent = 'Inactive';
      toggleButton.textContent = 'Start Intercepting';
      toggleButton.classList.remove('bg-red-600', 'hover:bg-red-700');
      toggleButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
  }
});