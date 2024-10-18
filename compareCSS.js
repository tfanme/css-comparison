const fs = require('fs');
const css = require('css');
const diff = require('diff');
const chalk = require('chalk');

function parseCssFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsedCss = css.parse(content, { silent: true });
        if (parsedCss.stylesheet && parsedCss.stylesheet.parsingErrors && parsedCss.stylesheet.parsingErrors.length > 0) {
            console.log(chalk.yellow(`Warning: Parsing errors in ${filePath}:`));
            parsedCss.stylesheet.parsingErrors.forEach(error => {
                console.log(chalk.yellow(`  Line ${error.line}: ${error.message}`));
            });
        }
        return parsedCss;
    } catch (error) {
        console.error(chalk.red(`Error reading or parsing ${filePath}: ${error.message}`));
        return null;
    }
}

function compareCss(file1, file2, options = {}) {
    const css1 = parseCssFile(file1);
    const css2 = parseCssFile(file2);

    if (!css1 || !css2) {
        console.error(chalk.red('Unable to compare CSS files due to parsing errors.'));
        return;
    }

    console.log(chalk.blue(`Comparing ${file1} and ${file2}:\n`));

    const rules1 = css1.stylesheet ? css1.stylesheet.rules || [] : [css1];
    const rules2 = css2.stylesheet ? css2.stylesheet.rules || [] : [css2];

    let added = 0, removed = 0, modified = 0;
    let details = [];

    rules1.forEach((rule1, index) => {
        const rule2 = rules2[index];
        if (!rule2) {
            removed++;
            details.push(chalk.red(`Removed: ${getSelector(rule1)}`));
        } else {
            const diffResult = diff.diffJson(rule1, rule2);
            if (diffResult.length > 1) {
                modified++;
                details.push(chalk.yellow(`Modified: ${getSelector(rule1)}`));
            }
        }
    });

    added = Math.max(0, rules2.length - rules1.length);

    // 打印摘要
    console.log(chalk.cyan('Summary:'));
    console.log(chalk.green(`  Added: ${added}`));
    console.log(chalk.red(`  Removed: ${removed}`));
    console.log(chalk.yellow(`  Modified: ${modified}`));
    console.log('\n');

    // 打印有限数量的详细信息
    const maxDetails = options.maxDetails || 10;
    console.log(chalk.cyan(`Details (showing first ${maxDetails}):`));
    details.slice(0, maxDetails).forEach(detail => console.log(detail));

    if (details.length > maxDetails) {
        console.log(chalk.gray(`... and ${details.length - maxDetails} more changes.`));
    }

    // 如果需要，生成完整报告
    if (options.fullReport) {
        const reportPath = `css_comparison_report_${Date.now()}.txt`;
        fs.writeFileSync(reportPath, details.join('\n'));
        console.log(chalk.cyan(`\nFull report saved to: ${reportPath}`));
    }
}

function getSelector(rule) {
    return rule.selectors ? rule.selectors.join(', ') : (rule.type || 'Unknown');
}

function stringifyRule(rule) {
    try {
        return css.stringify({ stylesheet: { rules: [rule] } });
    } catch (error) {
        return `[Unable to stringify rule: ${error.message}]`;
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

compareCss(file1, file2, { maxDetails: 10, fullReport });
