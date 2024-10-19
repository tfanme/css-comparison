# CSS Comparison Tool

A command-line tool for comparing two CSS files and highlighting their differences.

## Features

- Compare two CSS files and show added/removed lines
- Provide a summary of changes
- Generate a full diff report
- Handle invalid CSS files gracefully
- Easy to use command-line interface

## Installation

To install the CSS Comparison Tool globally, run:

```bash
npm install -g css-comparison-tool
```

## Usage

After installation, you can use the tool from the command line:

```bash
css-compare <file1.css> <file2.css> [options]
```

### Options

- `--full-report`: Generate a full diff report file

### Examples

Compare two CSS files:
```bash
css-compare styles1.css styles2.css
```

Compare two CSS files and generate a full report:
```bash
css-compare styles1.css styles2.css --full-report
```

## Output

The tool provides:
1. A summary of added and removed lines
2. A colorized diff of the changes (limited to the first 100 lines by default)
3. An option to generate a full diff report file

## Error Handling

The tool gracefully handles various error scenarios:
- Non-existent files
- Invalid CSS syntax
- Parsing errors

In case of errors, appropriate error messages will be displayed.

## Development

To set up the project for development:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Use `npm test` to run the test suite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.