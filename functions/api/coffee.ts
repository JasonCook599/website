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
  // Function to parse query strings
  function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    name = name.replace(/\//g, "");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(request.url);

    if (!results) 
      return null;
    else if (!results[2]) 
      return "";
    else if (results[2]) {
      results[2] = results[2].replace(/\//g, "");
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  const location = getParameterByName("location");

  if (request.method === "OPTIONS") {
    return new Response("OK", {headers: ApiHeaders(request)});
  } else if (request.method === "GET") {
    // concat CORS and application
    const responseHeaders = {
      ...ApiHeaders(request),
      "content-type": "application/json;charset=UTF-8"
    };
    const coffee = JSON.parse(await context.env.coffee.get(location));
    const responseJson = JSON.stringify({location: location, date: coffee.date});
    return new Response(responseJson, {headers: responseHeaders});
  } else if (request.method === "POST") {
    // TODO add authentication
    // create json response
    const dateJson = JSON.stringify({
      date: new Date(Date.now())
    });

    await context.env.coffee.put(location, dateJson);
    return new Response("OK", {headers: ApiHeaders(request)});
  } else {
    return new Response("Bad Request", {
      status: 400,
      headers: ApiHeaders(request)
    });
  }
}
