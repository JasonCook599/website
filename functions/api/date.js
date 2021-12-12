export async function onRequest(context) {
    // Contents of context object
    const {
        request, // same as existing Worker API
        env, // same as existing Worker API
        params, // if filename includes [id] or [[path]]
        waitUntil, // same as ctx.waitUntil in existing Worker API
        next, // used for middleware or to fetch assets
        data, // arbitrary space for passing data between middlewares
    } = context;

    // List of origins allowed to access API
    // First origin will be returned unless another match is found
    const allowedOrigins = [
        "http://time.tectic.ca",
        "http://localhost:8080"
    ]

    // Function to return CORS headers
    const corsHeaders = origin => ({
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Origin": origin,
    })

    // Check origin. If allowed, return in header. Otherwise return first origin in list.
    const checkOrigin = request => {
        const foundOrigin = allowedOrigins.find(allowedOrigin => allowedOrigin.includes(request.headers.get("Origin")))
        return foundOrigin ? foundOrigin : allowedOrigins[0]
    }

    async function handleRequest(event) {
        // Check if origin is valid
        const allowedOrigin = checkOrigin(event.request)

        if (event.request.method === "OPTIONS") {
            return new Response("OK", { headers: corsHeaders() })
        }

        if (event.request.method === "GET") {
            // Application headers
            const applicationHeaders = ({
                "content-type": "application/json;charset=UTF-8"
            })

            // concat CORS and application
            const responseHeaders = {
                ...corsHeaders(allowedOrigin),
                ...applicationHeaders
            }

            // create json response
            const dateJson = JSON.stringify({
                date: new Date(Date.now() - (1000 * 60 * 60))
            })

            return new Response(dateJson, {
                headers: responseHeaders
            })
        }
        return

    }
}