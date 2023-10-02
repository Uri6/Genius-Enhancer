import browser = global.browser;

export function injectScript(url: any) {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL(url);
    (document.head || document.documentElement).appendChild(script);
}

export function injectCSS(url: any) {
    const link = document.createElement("link");
    link.href = browser.runtime.getURL(url);
    link.rel = "stylesheet";
    (document.head || document.documentElement).appendChild(link);
}
