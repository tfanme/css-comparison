const fs = require('fs');
const css = require('css');
const diff = require('diff');
const chalk = require('chalk');

function parseCssFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return css.parse(content, { silent: true });
    } catch (error) {
        console.error(chalk.red(`Error reading or parsing ${filePath}: ${error.message}`));
        return null;
    }
}

function stringifyCss(ast) {
    return css.stringify(ast, { compress: false });
}

function compareCss(file1, file2, options = {}) {
    const css1 = parseCssFile(file1);
    const css2 = parseCssFile(file2);

    if (!css1 || !css2) {
        console.error(chalk.red('Unable to compare CSS files due to parsing errors.'));
        return;
    }

    const string1 = stringifyCss(css1);
    const string2 = stringifyCss(css2);

    const differences = diff.createPatch('css_diff', string1, string2, 'File 1', 'File 2');

    // 打印摘要
    const lines = differences.split('\n');
    let added = 0, removed = 0;
    lines.forEach(line => {
        if (line.startsWith('+')) added++;
        if (line.startsWith('-')) removed--;
    });

    console.log(chalk.cyan('Summary:'));
    console.log(chalk.green(`  Added lines: ${added}`));
    console.log(chalk.red(`  Removed lines: ${Math.abs(removed)}`));
    console.log('\n');

    // 打印有限数量的差异行
    const maxLines = options.maxLines || 100;
    console.log(chalk.cyan(`Diff (showing first ${maxLines} lines):`));
    lines.slice(0, maxLines).forEach(line => {
        if (line.startsWith('+')) {
            console.log(chalk.green(line));
        } else if (line.startsWith('-')) {
            console.log(chalk.red(line));
        } else if (line.startsWith('@')) {
            console.log(chalk.cyan(line));
        } else {
            console.log(line);
        }
    });

    if (lines.length > maxLines) {
        console.log(chalk.gray(`... and ${lines.length - maxLines} more lines.`));
    }

    // 如果需要，生成完整报告
    if (options.fullReport) {
        const reportPath = `css_diff_report_${Date.now()}.diff`;
        fs.writeFileSync(reportPath, differences);
        console.log(chalk.cyan(`\nFull diff report saved to: ${reportPath}`));
    }
}

// Usage
const file1 = process.argv[2];
const file2 = process.argv[3];
const fullReport = process.argv.includes('--full-report');

if (!file1 || !file2) {
    console.error('Please provide two CSS file paths as arguments');
    process.exit(1);
}

compareCss(file1, file2, { maxLines: 100, fullReport });