/**
 * EduHub Brasil - Security Utilities
 * Implements XSS prevention and input sanitization.
 */

const Security = {
    /**
     * Sanitizes HTML strings using a whitelist-based approach simple for SPAs.
     * Prevents script execution via innerHTML.
     */
    sanitize(html) {
        if (!html) return '';
        
        // Use a function-based replace to selectively allow safe event handlers
        return html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/on\w+="([^"]*)"/gim, (match, content) => {
                // Allow only safe prefixes: Router.navigate, Router.back, App., window.open, or history.back
                const isSafe = content.startsWith('Router.navigate') || 
                               content.startsWith('Router.back') ||
                               content.startsWith('App.') || 
                               content.startsWith('AppState.') || 
                               content.startsWith('SoundManager.') || 
                               content.startsWith('window.open') ||
                               content.startsWith('history.back') ||
                               content.startsWith('window.history.back');
                
                if (isSafe) {
                    return match;
                }
                return ""; // Strip unsafe handlers
            })
            .replace(/on\w+='([^']*)'/gim, (match, content) => {
                const isSafe = content.startsWith('Router.navigate') || 
                               content.startsWith('Router.back') ||
                               content.startsWith('App.') || 
                               content.startsWith('AppState.') || 
                               content.startsWith('SoundManager.') || 
                               content.startsWith('window.open') ||
                               content.startsWith('history.back') ||
                               content.startsWith('window.history.back');
                if (isSafe) {
                    return match;
                }
                return "";
            })
            .replace(/javascript:[^"']*/gim, "")
            .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
            .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gim, "")
            .replace(/<embed\b[^>]*>([\s\S]*?)<\/embed>/gim, "");
    },

    /**
     * Escapes HTML special characters to prevent injection.
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.Security = Security;
