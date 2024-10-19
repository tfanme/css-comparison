const fs = require('fs');
const css = require('css');
const diff = require('diff');
const chalk = require('chalk');

function parseCssFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = css.parse(content, { silent: true });
        if (result.stylesheet.parsingErrors && result.stylesheet.parsingErrors.length > 0) {
            return { error: `Error parsing ${filePath}: ${result.stylesheet.parsingErrors[0].message}` };
        }
        return result;
    } catch (error) {
        return { error: `Error reading or parsing ${filePath}: ${error.message}` };
    }
}

function stringifyCss(ast) {
    if (ast.error) {
        return ast.error;
    }
    return css.stringify(ast, { compress: false });
}

function compareCss(file1, file2, options = {}) {
    const css1 = parseCssFile(file1);
    const css2 = parseCssFile(file2);

    if (css1.error || css2.error) {
        return { error: `${css1.error}\n${css2.error}` };
    }
    if (css1.error) {
        return { error: css1.error };
    }
    if (css2.error) {
        return { error: css2.error };
    }

    const string1 = stringifyCss(css1);
    const string2 = stringifyCss(css2);

    const differences = diff.createPatch('css_diff', string1, string2, 'File 1', 'File 2');

    const lines = differences.split('\n');
    let added = 0, removed = 0;
    const contentDiff = lines.slice(4); // 跳过头部的文件信息

    contentDiff.forEach(line => {
        if (line.startsWith('+')) added++;
        if (line.startsWith('-')) removed++;
    });

    return {
        summary: {
            added,
            removed: Math.abs(removed)
        },
        diff: differences,
        lines: contentDiff.slice(0, options.maxLines || 100)
    };
}

module.exports = {
    compareCss
};
