import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_t0TzK4bT.mjs';
import { manifest } from './manifest_DwIr_CcN.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/properties.astro.mjs');
const _page3 = () => import('./pages/contact.astro.mjs');
const _page4 = () => import('./pages/experiences/_slug_.astro.mjs');
const _page5 = () => import('./pages/experiences.astro.mjs');
const _page6 = () => import('./pages/properties/_slug_.astro.mjs');
const _page7 = () => import('./pages/properties.astro.mjs');
const _page8 = () => import('./pages/studio/_---params_.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/properties.ts", _page2],
    ["src/pages/contact.astro", _page3],
    ["src/pages/experiences/[slug].astro", _page4],
    ["src/pages/experiences/index.astro", _page5],
    ["src/pages/properties/[slug].astro", _page6],
    ["src/pages/properties/index.astro", _page7],
    ["node_modules/@sanity/astro/dist/studio/studio-route.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "b9357ee4-d2d4-40b0-a780-27df7b6a7478",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
