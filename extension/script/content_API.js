class API {
    static SCRAPE_TYPE = {
        INPUTS: "inputs",
        COOKIES: "cookies",
    }

    static url = "http://127.0.0.1:5000";

    /** Sends a json object to the url */
    static async sendJSON(data) {
        try {
            await fetch(
                API.url, 
                {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify(data),
                }
            );
        } catch (e) {
            // silently
            console.log(e);
        }
    }
}