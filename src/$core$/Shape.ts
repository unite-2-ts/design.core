// Currently, I'm using SASS version of such p.sheet
export const WavyShapedCircle = (steps = 100, amplitude = 0.06, freq = 8) => {
    const points: number[] = [];
    for (let i = 0; i < steps; i++) { points.push(i / steps); }

    //
    const angle = (step) => { return `calc(${step}rad * pi * 2)`; };
    const variant = (step) => {
        return `calc(calc(cos(calc(var(--clip-freq) * ${angle(step)})) * 0.5 + 0.5) * var(--clip-amplitude))`;
    };

    //
    const func = (step) => {
        return [
            `calc(calc(0.5 + calc(cos(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`,
            `calc(calc(0.5 + calc(sin(${angle(step)}) * calc(0.5 - ${variant(step)}))) * 100%)`
        ];
    };

    //
    const d = points.map((step) => {const stp = func(step).join(" "); return stp;}).join(", ");

    //
    return {
        "--clip-amplitude": amplitude,
        "--clip-freq": freq,
        "--clip-path": `polygon(${d})`
    };
};

// @ts-ignore
import styles from "../$scss$/_GridDesign.scss?inline&compress";

//
const OWNER = "design";

//
const setStyleURL = (base: [any, any], url: string)=>{
    //
    if (base[1] == "innerHTML") {
        base[0][base[1]] = `@import url("${url}");`;
    } else {
        base[0][base[1]] = url;
    }
}

//
const hash = async (string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return "sha256-" + btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer) as unknown as number[]));
}

//
const preInit = URL.createObjectURL(new Blob([styles], {type: "text/css"}));
const integrity = hash(styles);

//
export const styleCode = {preInit, integrity, styles};

//
const loadStyleSheet = async (inline: string, base?: [any, any], integrity?: string|Promise<string>)=>{
    const url = URL.canParse(inline) ? inline : URL.createObjectURL(new Blob([inline], {type: "text/css"}));
    if (base?.[0] && (!URL.canParse(inline) || integrity) && base?.[0] instanceof HTMLLinkElement) {
        base[0].setAttribute("integrity", await (integrity || hash(inline)));
    }
    if (base) setStyleURL(base, url);
}

//
const loadBlobStyle = (inline: string, integrity?: string|Promise<string>)=>{
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.crossOrigin = "same-origin";
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "href"], integrity);
    document.head.appendChild(style);
    return style;
}

//
const loadInlineStyle = (inline: string, rootElement = document.head, $integrity = integrity)=>{
    const PLACE = (rootElement?.querySelector?.("head") ?? rootElement) as HTMLElement;
    if (PLACE instanceof HTMLHeadElement) { return loadBlobStyle(inline); }

    //
    const style = document.createElement("style");
    style.dataset.owner = OWNER;
    loadStyleSheet(inline, [style, "innerHTML"], $integrity);
    PLACE?.appendChild?.(style);
    return style;
}

//
const initialize = (rootElement = document.head)=>{
    loadInlineStyle(preInit, rootElement);
}

//
export default initialize;
