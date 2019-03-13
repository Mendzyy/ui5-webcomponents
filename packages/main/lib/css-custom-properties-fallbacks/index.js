const fs = require('fs');
const getopts = require('getopts');
const glob = require("glob");
const mkdirp = require("mkdirp");

// The default theme can be passed via a parameter
const options = getopts(process.argv.slice(2), {
	alias: {
		d: "defaultTheme"
	}
});
const defaultTheme = options.defaultTheme || "sap_fiori_3";

// Read the default theme parameters file
const paramsBundle = fs.readFileSync(`dist/themes-next/${defaultTheme}/parameters-bundle.css`, 'utf8');

// Extract the variables
const vars = new Map();
const couples = paramsBundle.match(/--[^:)]+:\s*[^;}]+/g) || [];
couples.forEach(couple => {
	const [varName, varValue] = couple.split(/:\s*/);
	vars.set(varName, varValue);
});

// Add the fallback values for all web components
mkdirp.sync("dist/themes-next/tmp");
glob("dist/themes-next/*.css", {}, function (er, files) {
	files.forEach(file => {
		let componentCSS = fs.readFileSync(file, 'utf8');
		vars.forEach((varValue, varName) => {
			const re = new RegExp(`var\\(\\s*${varName}\\s*\\)`, "g");
			componentCSS = componentCSS.replace(re, `var(${varName}, ${varValue})`);
		});
		fs.writeFileSync(file, componentCSS);

		// Temporary - create the dist tmp file
		fs.writeFileSync(file.replace('themes-next', 'themes-next/tmp'), componentCSS);
		// Temporary - create the src tmp file
		fs.writeFileSync(file.replace('dist', 'src').replace('themes-next', 'themes-next/tmp'), componentCSS);
	});
});