
function timer() {
    let timeLeft = 10;
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            Delete_verification();
        } else {
            timeLeft--;
        }
    }, 1000);
}

function Delete_verification() {
    if (document.getElementById('Floating-Window')) {
        notneeded();
    } else {
        return;
    }
}

function notneeded() {
    const tooltip = document.getElementById('Floating-Window');
    if (tooltip) {
        tooltip.remove();
    }
}

function createPopup(message) {
    const existingPopup = document.getElementById('Floating-Window');
    if (existingPopup) return;

    const popup = document.createElement('div');
    popup.id = 'Floating-Window';
    popup.className = 'Floating-window';

    const parentDiv = document.createElement('div');
    parentDiv.id = 'parent';
    parentDiv.className = 'parent';

    const contentDiv = document.createElement('div');
    contentDiv.id = 'Content';
    contentDiv.innerHTML = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'closing';
    closeButton.onclick = notneeded;

    parentDiv.appendChild(contentDiv);
    parentDiv.appendChild(closeButton);
    popup.appendChild(parentDiv);
    document.body.appendChild(popup);
}
function getMessage(type, callback) {
    chrome.runtime.sendMessage({ action: 'getMessages' }, (response) => {
        const storedMessages = JSON.parse(response[type] || '{}');
        const url = window.location.href;
        const domain = new URL(url).hostname; // Extracts the domain like "docs.google.com"
        const fullPath = new URL(url).href;
        const queryParams = new URL(url).searchParams;
        const searchQuery = queryParams.get("q");

        let exactMatchMessage = null;

        // Step 1: Check for specific "easter egg" keyword in the search query (like "q=javascript")
        if (searchQuery) {
            const keyword = searchQuery.toLowerCase();
            const easterEggMessages = {
                "javascript": "You've unlocked a special JavaScript Easter egg!",
                // Add more keyword-specific Easter egg messages here
            };

            if (easterEggMessages[keyword]) {
                exactMatchMessage = easterEggMessages[keyword];
            }
        }

        // Step 2: If no keyword match, check for an exact domain match
        if (!exactMatchMessage) {
            if (storedMessages[domain]) {
                exactMatchMessage = storedMessages[domain];
            }

            if (storedMessages[fullPath]) {
                exactMatchMessage = storedMessages[fullPath];
            }

            // Step 3: Check for subdomain or parent domain matches
            const subdomainParts = domain.split('.'); // Split domain into parts
            const subdomainMatches = []; // To hold possible matches

            // Build possible subdomains (e.g., "google.com" from "docs.google.com")
            for (let i = 0; i < subdomainParts.length; i++) {
                subdomainMatches.push(subdomainParts.slice(i).join('.'));
            }

            // Check for subdomain matches, prioritizing more specific matches first
            for (let subdomain of subdomainMatches) {
                if (storedMessages[subdomain]) {
                    if (!exactMatchMessage) {
                        exactMatchMessage = storedMessages[subdomain]; // Take the first match found
                    }
                }
            }

            // Step 4: If no exact match, check for keyword matches in the URL
            if (!exactMatchMessage) {
                for (let keyword in storedMessages) {
                    if (url.includes(keyword.toLowerCase())) {
                        exactMatchMessage = storedMessages[keyword];
                        break;
                    }
                }
            }
        }

        // Step 5: Determine which message to display
        if (exactMatchMessage) {
            const randomMessage = Array.isArray(exactMatchMessage)
                ? exactMatchMessage[Math.floor(Math.random() * exactMatchMessage.length)]
                : exactMatchMessage;
            callback(randomMessage);
        } else {
            callback(null);
        }
    });
}
function verifyMessage() {
    getMessage('untrustedWebsites', (untrustedMessage) => {
        if (untrustedMessage) {
            createPopup(untrustedMessage);
            timer();
        } else {
            getMessage('websiteMessages', (trustedMessage) => {
                if (trustedMessage) {
                    createPopup(trustedMessage);
                    timer();
                }
            });
        }
        
    });
}

window.onload = verifyMessage;




