import { getTheme } from "../Configuration";
import { attachThemeChange, getEffectiveStyle } from "../Theming";

class StyleInjection {
	constructor() {
		this.tagNamesInHead = [];
		this.tagsToStyleUrls = new Map();
		attachThemeChange(this.updateStylesInHead.bind(this));
	}

	createStyleTag(tagName, styleUrls, cssText) {
		if (this.tagNamesInHead.indexOf(tagName) !== -1) {
			return;
		}

		const style = document.createElement("style");
		style.type = "text/css";
		style.setAttribute("data-sap-source", tagName);
		style.innerHTML = cssText;
		document.head.appendChild(style);

		if (window.CSSVarsPolyfill) {
			window.CSSVarsPolyfill.resolveCSSVars([style]);
		}

		this.tagNamesInHead.push(tagName);
		this.tagsToStyleUrls.set(tagName, styleUrls);
	}

	async updateStylesInHead() {
		if (!window.ShadyDOM) {
			return;
		}

		const theme = getTheme();
		this.tagNamesInHead.forEach(async tagName => {
			const styleUrls = this.tagsToStyleUrls.get(tagName);
			const css = await getEffectiveStyle(theme, styleUrls, tagName);

			const styleElement = document.head.querySelector(`style[data-sap-source="${tagName}"]`);

			if (styleElement) {
				styleElement.innerHTML = css || "";	// in case of undefined
			} else {
				this.createStyleTag(tagName, styleUrls, css || "");
			}
		});
	}
}

const injectThemeProperties = styles => {
	const styleElement = document.head.querySelector(`style[ui5-webcomponents-theme-properties]`);

	if (styleElement) {
		styleElement.innerHTML = styles || "";	// in case of undefined
	} else {
		const style = document.createElement("style");
		style.type = "text/css";
		style.setAttribute("ui5-webcomponents-theme-properties", "");
		style.innerHTML = styles;
		document.head.appendChild(style);

		if (window.CSSVarsPolyfill) {
			window.CSSVarsPolyfill.findCSSVars([style]);
		}
	}
};

export { injectThemeProperties };
export default new StyleInjection();
