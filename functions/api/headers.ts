export function ApiHeaders(request) {
  // List of origins allowed to access API. First origin will be returned unless another match is found
  const allowedOrigins = ["https://tectic.ca", "https://jasoncook.ca", "http://localhost:8080", "http://localhost:8788"];

  // Function to return CORS headers
  const corsHeaders = (origin) => ({"Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET", "Access-Control-Allow-Origin": origin});

  // Check origin. If allowed, return in header. Otherwise return first origin in list.
  const checkOrigin = (request) => {
    const foundOrigin = allowedOrigins.find((allowedOrigin) => allowedOrigin.includes(request.headers.get("Origin")));
    return foundOrigin
      ? foundOrigin
      : allowedOrigins[0];
  };
  // Check if origin is valid
  const allowedOrigin = checkOrigin(request);
  return corsHeaders(allowedOrigin);
}
