const assert = require('assert');
const { compareCss } = require('../lib/compareCSS');
const fs = require('fs');
const path = require('path');

describe('CSS Comparison Tool', () => {
    const testFile1 = path.join(__dirname, 'test1.css');
    const testFile2 = path.join(__dirname, 'test2.css');

    before(() => {
        fs.writeFileSync(testFile1, 'body {\n  color: black;\n}');
        fs.writeFileSync(testFile2, 'body {\n  color: white;\n}');
    });

    after(() => {
        fs.unlinkSync(testFile1);
        fs.unlinkSync(testFile2);
    });

    it('should correctly compare two CSS files', () => {
        const result = compareCss(testFile1, testFile2);
        assert.strictEqual(result.summary.added, 1);
        assert.strictEqual(result.summary.removed, 1);
        assert(result.diff.includes('-  color: black;'));
        assert(result.diff.includes('+  color: white;'));
    });

    it('should handle the maxLines option', () => {
        const result = compareCss(testFile1, testFile2, { maxLines: 1 });
        assert.strictEqual(result.lines.length, 1);
    });

    it('should not count file headers as content diff', () => {
        const result = compareCss(testFile1, testFile2);
        assert(!result.lines.some(line => line.startsWith('---') || line.startsWith('+++')));
    });

    it('should handle non-existent files', () => {
        const result = compareCss('non-existent1.css', 'non-existent2.css');
        assert(result.error.includes('Error reading or parsing non-existent1.css'));
    });

    it('should handle invalid CSS files', () => {
        const invalidFile = path.join(__dirname, 'invalid.css');
        fs.writeFileSync(invalidFile, 'This is not valid CSS');
        const result = compareCss(invalidFile, testFile1);
        assert(result.error.includes('Error parsing'));
        fs.unlinkSync(invalidFile);
    });

    it('should handle both files being invalid', () => {
        const invalidFile1 = path.join(__dirname, 'invalid1.css');
        const invalidFile2 = path.join(__dirname, 'invalid2.css');
        fs.writeFileSync(invalidFile1, 'This is not valid CSS');
        fs.writeFileSync(invalidFile2, 'This is also not valid CSS');
        const result = compareCss(invalidFile1, invalidFile2);
        assert(result.error.includes('Error parsing'));
        assert(result.error.includes('invalid1.css'));
        assert(result.error.includes('invalid2.css'));
        fs.unlinkSync(invalidFile1);
        fs.unlinkSync(invalidFile2);
    });
});