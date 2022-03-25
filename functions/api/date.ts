import {ApiHeaders} from "./headers";

export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data // arbitrary space for passing data between middlewares
  } = context;

  if (request.method === "OPTIONS") {
    return new Response("OK", {headers: ApiHeaders(request)});
  } else if (request.method === "GET") {
    // concat CORS and application
    const responseHeaders = {
      ...ApiHeaders(request),
      "content-type": "application/json;charset=UTF-8"
    };
    // create json response
    const dateJson = JSON.stringify({
      date: new Date(Date.now())
    });
    return new Response(dateJson, {headers: responseHeaders});
  } else {
    return new Response("Bad Request", {
      status: 400,
      headers: ApiHeaders(request)
    });
  }
}
