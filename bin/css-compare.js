#!/usr/bin/env node

const { compareCss } = require('../lib/compareCSS');
const chalk = require('chalk');
const fs = require('fs');

const [,, file1, file2, ...args] = process.argv;
const fullReport = args.includes('--full-report');

if (!file1 || !file2) {
    console.error(chalk.red('Please provide two CSS file paths as arguments'));
    process.exit(1);
}

const result = compareCss(file1, file2, { maxLines: 100, fullReport });
if (result.error) {
    console.error(chalk.red(result.error));
    process.exit(1);
}

// 打印摘要
console.log(chalk.cyan('Summary:'));
console.log(chalk.green(`  Added lines: ${result.summary.added}`));
console.log(chalk.red(`  Removed lines: ${Math.abs(result.summary.removed)}`));
console.log('\n');

// 打印有限数量的差异行
console.log(chalk.cyan(`Diff (showing first ${result.lines.length} lines):`));
result.lines.forEach(line => {
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

if (result.diff.split('\n').length > result.lines.length + 4) {
    console.log(chalk.gray(`... and ${result.diff.split('\n').length - result.lines.length - 4} more lines.`));
}

// 如果需要，生成完整报告
if (fullReport) {
    const reportPath = `css_diff_report_${Date.now()}.diff`;
    fs.writeFileSync(reportPath, result.diff);
    console.log(chalk.cyan(`\nFull diff report saved to: ${reportPath}`));
}
