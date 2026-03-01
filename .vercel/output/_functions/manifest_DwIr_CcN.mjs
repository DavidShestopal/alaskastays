import 'piccolore';
import { q as decodeKey } from './chunks/astro/server_BQbjXtvi.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_oTlK9Ijf.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/davidshestopal/Desktop/alaskastays/","cacheDir":"file:///Users/davidshestopal/Desktop/alaskastays/node_modules/.astro/","outDir":"file:///Users/davidshestopal/Desktop/alaskastays/dist/","srcDir":"file:///Users/davidshestopal/Desktop/alaskastays/src/","publicDir":"file:///Users/davidshestopal/Desktop/alaskastays/public/","buildClientDir":"file:///Users/davidshestopal/Desktop/alaskastays/dist/client/","buildServerDir":"file:///Users/davidshestopal/Desktop/alaskastays/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"experiences/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/experiences","isIndex":true,"type":"page","pattern":"^\\/experiences\\/?$","segments":[[{"content":"experiences","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/experiences/index.astro","pathname":"/experiences","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"properties/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/properties","isIndex":true,"type":"page","pattern":"^\\/properties\\/?$","segments":[[{"content":"properties","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/properties/index.astro","pathname":"/properties","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/properties","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/properties\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"properties","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/properties.ts","pathname":"/api/properties","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"body{margin:0;padding:0}\n"}],"routeData":{"type":"page","isIndex":false,"route":"/studio/[...params]","pattern":"^\\/studio(?:\\/(.*?))?\\/?$","segments":[[{"content":"studio","dynamic":false,"spread":false}],[{"content":"...params","dynamic":true,"spread":true}]],"params":["...params"],"component":"node_modules/@sanity/astro/dist/studio/studio-route.astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"external","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/davidshestopal/Desktop/alaskastays/node_modules/@sanity/astro/dist/studio/studio-route.astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/experiences/[slug].astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/experiences/index.astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/properties/[slug].astro",{"propagation":"none","containsHead":true}],["/Users/davidshestopal/Desktop/alaskastays/src/pages/properties/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/properties@_@ts":"pages/api/properties.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/experiences/[slug]@_@astro":"pages/experiences/_slug_.astro.mjs","\u0000@astro-page:src/pages/experiences/index@_@astro":"pages/experiences.astro.mjs","\u0000@astro-page:src/pages/properties/[slug]@_@astro":"pages/properties/_slug_.astro.mjs","\u0000@astro-page:src/pages/properties/index@_@astro":"pages/properties.astro.mjs","\u0000@astro-page:node_modules/@sanity/astro/dist/studio/studio-route@_@astro":"pages/studio/_---params_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DwIr_CcN.mjs","/Users/davidshestopal/Desktop/alaskastays/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_D_gqmpmO.mjs","@astrojs/react/client.js":"_astro/client.eUMmiz80.js","/Users/davidshestopal/Desktop/alaskastays/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.B8pFbOAJ.js","/Users/davidshestopal/Desktop/alaskastays/src/components/Header.astro?astro&type=script&index=0&lang.ts":"_astro/Header.astro_astro_type_script_index_0_lang.BuUH9ijY.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources2.js":"_astro/resources2.DGBwvEda.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources6.js":"_astro/resources6.BHmPcXiL.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/VideoPlayer.js":"_astro/VideoPlayer.BuFNa5ru.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources4.js":"_astro/resources4.DsMty8o6.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources.js":"_astro/resources.CfAWrIYg.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources5.js":"_astro/resources5.CZgh5wwL.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources3.js":"_astro/resources3.CKCffzWX.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/ViteDevServerStopped.js":"_astro/ViteDevServerStopped.CITx0hS1.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/@sanity/client/dist/_chunks-es/stegaEncodeSourceMap.js":"_astro/stegaEncodeSourceMap.Dy7jVymp.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/@sanity/ui/dist/_chunks-es/refractor.mjs":"_astro/refractor.924yo3o5.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/index2.js":"_astro/index2.DWvDO5UA.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/index3.js":"_astro/index3.D_H5yI8f.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/index4.js":"_astro/index4.Dx82ZsDd.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/sanity/lib/_chunks-es/resources7.js":"_astro/resources7.DEoH2qpb.js","/Users/davidshestopal/Desktop/alaskastays/node_modules/@sanity/astro/dist/studio/studio-component":"_astro/studio-component.st3si9xr.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/davidshestopal/Desktop/alaskastays/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts","const a=new IntersectionObserver(e=>{e.forEach(r=>{r.isIntersecting&&(r.target.classList.add(\"revealed\"),a.unobserve(r.target))})},{threshold:.08,rootMargin:\"0px 0px -40px 0px\"});document.querySelectorAll(\"[data-reveal], [data-reveal-left], [data-reveal-scale]\").forEach(e=>a.observe(e));document.querySelectorAll(\"[data-stagger]\").forEach(e=>{const r=e.children;Array.from(r).forEach((t,l)=>{t.style.transitionDelay=`${l*120}ms`})});"],["/Users/davidshestopal/Desktop/alaskastays/src/components/Header.astro?astro&type=script&index=0&lang.ts","const e=document.getElementById(\"site-header\"),t=document.getElementById(\"menu-toggle\"),o=document.querySelectorAll(\".mobile-nav-link\");e.dataset.variant===\"transparent\"&&window.addEventListener(\"scroll\",()=>{window.scrollY>80?e.classList.add(\"scrolled\"):e.classList.remove(\"scrolled\")});t.addEventListener(\"click\",()=>{e.classList.toggle(\"menu-open\"),document.body.style.overflow=e.classList.contains(\"menu-open\")?\"hidden\":\"\"});o.forEach(n=>{n.addEventListener(\"click\",()=>{e.classList.remove(\"menu-open\"),document.body.style.overflow=\"\"})});"]],"assets":["/_astro/about.Cz4qDQvu.css","/Alaska-Stays-Valley-View.avif","/favicon.svg","/_astro/VideoPlayer.BuFNa5ru.js","/_astro/ViteDevServerStopped.CITx0hS1.js","/_astro/browser.De2YF0rA.js","/_astro/client.Dq0OWfUj.js","/_astro/client.eUMmiz80.js","/_astro/index2.DWvDO5UA.js","/_astro/index3.D_H5yI8f.js","/_astro/index4.Dx82ZsDd.js","/_astro/refractor.924yo3o5.js","/_astro/resources.CfAWrIYg.js","/_astro/resources2.DGBwvEda.js","/_astro/resources3.CKCffzWX.js","/_astro/resources4.DsMty8o6.js","/_astro/resources5.CZgh5wwL.js","/_astro/resources6.BHmPcXiL.js","/_astro/resources7.DEoH2qpb.js","/_astro/stegaEncodeSourceMap.Dy7jVymp.js","/_astro/studio-component.DbK-f-AI.js","/_astro/studio-component.st3si9xr.js","/images/alaskastayslogo.svg","/images/treeline-silhouette-dark.svg","/images/treeline-silhouette-dark.svg.bak","/images/treeline-silhouette.svg","/about/index.html","/contact/index.html","/experiences/index.html","/properties/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"oZpfTmcVJtcbHtMYq/qdBgNh+wBqy1DZOmwwOS8KpuQ="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
