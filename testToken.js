// testToken.js
const token = "EAAPZB0HVm6CMBQqlaF2QxIORgdhIuioVY1Q8kSUis2ire3cVhQZCCwZBPZCjxmENEClZAnajz2ri6RiPEXI5eWdsKSurvZBYuqFy7p5y2PiLVQ3vGD81ZAPquEVITShHSPnlYFJWeOZBFjq50SDvRrBcPnBwGTSOEDJOCQZAk8AQkuDfQo9wUyPu5OIfr3GmR";

(async () => {
    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Token validation failed:', data);
        } else {
            console.log('Token is valid. Response:', data);
        }
    } catch (e) {
        console.error('Error during validation:', e);
    }
})();
