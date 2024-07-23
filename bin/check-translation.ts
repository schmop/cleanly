import { Node, Project, SyntaxKind, Type } from "ts-morph";
import { addSourceFiles } from "./source-collector";
import chalk from "chalk";
import { german } from "../src/translation/german";
import { keys } from "../src/common/keys";
import { entries } from "../src/common/entries";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
    addFilesFromTsConfig: false,
});

const sourceFiles = await addSourceFiles(project);
const excludedPaths = [
    "src/translation/",
]

const translationFunctionNames = ["_t", "__t", "_n", "__n"];
// Vue compiler unrefs imports
translationFunctionNames.push(...translationFunctionNames.map(name => `_unref(${name})`));

const translatableStrings: Set<string> = new Set();


function cutQuotes(text: string): string {
    return text.slice(1, -1);
}

function gray(text: string): string {
    return chalk.rgb(180, 180, 180)(text);
}

function warn(node: Node, message: string) {
    const sourceFile = node.getSourceFile();
    const fileName = sourceFile.getFilePath().replace(process.cwd() + "/src/", "");
    const startLine = node.getStartLineNumber();
    const endLine = node.getEndLineNumber();
    const startLinePos = node.getStartLinePos();
    const faultySource = sourceFile.getFullText().split("\n").slice(startLine - 1, endLine).join("\n");
    const highlightColStart = sourceFile.getLineAndColumnAtPos(node.getStart()).column - 1;
    const highlightColEnd = sourceFile.getLineAndColumnAtPos(node.getEnd()).column - 1;
    const squiggle = " ".repeat(highlightColStart) + "^".repeat(highlightColEnd - highlightColStart);
    //console.warn(`${fileName} (${startLine}:${startLinePos}): ${message}\n${faultySource}\n${squiggle}`);
    console.warn(
        chalk.white(fileName)
        + chalk.cyan(` (${startLine}:${startLinePos})`) + ": "
        + chalk.red(message) + "\n"
        + gray(faultySource) + "\n"
        + chalk.red(squiggle)
    );
}

function collectType(node: Node, type: Type) {
    if (type.isUnion()) {
        type.getUnionTypes().forEach(type => {
            if (!type.isLiteral()) {
                warn(node, "Unknown type in union: " + type.getText());
                return;
            }
            translatableStrings.add(cutQuotes(type.getText()));
        });
        return;
    }
    warn(node, "Unknown type: " + type.getText());
}

function collectExpressionStringLiterals(node: Node) {
    if (node.getKind() === SyntaxKind.StringLiteral) {
        translatableStrings.add(cutQuotes(node.getText()));
        return;
    } if (node.getKind() === SyntaxKind.Identifier) {
        collectType(node, node.getType());
        return;
    }
    if (node.getKind() === SyntaxKind.CallExpression) {
        const call = node.asKindOrThrow(SyntaxKind.CallExpression);
        collectType(node, call.getReturnType());
        return;
    }
    if (node.getKind() === SyntaxKind.TemplateExpression) {
        warn(node, "Template strings cannot be analyzed, maybe use formatted translation '__t()' instead?");
        return;
    }
    if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propAccess = node.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        collectType(node, propAccess.getType());
        return;
    }
    warn(node, `Invalid argument for translation function with argument "${node.getText()}"`);
    console.warn(`The expression is of kind: ${node.getKindName()}`);
}

sourceFiles.forEach(sourceFile => {
    //console.log("Checking file", sourceFile.getFilePath());
    if (excludedPaths.some(path => sourceFile.getFilePath().includes(path))) {
        return;
    }
    sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
            const callExpression = node.asKind(SyntaxKind.CallExpression);
            if (undefined === callExpression) {
                return;
            }
            const functionName = callExpression.getExpression().getText();
            if (translationFunctionNames.includes(functionName)) {
                const callArgs = callExpression.getArguments();
                const firstArgument = callArgs[0];
                collectExpressionStringLiterals(firstArgument);
            }
        }
    });
});

const languages = {
    german,
};
let hasMissingTranslations: boolean = false;
entries(languages).forEach(([languageName, language]) => {
    const translationStringCopy: Set<string> = new Set(translatableStrings);
    let numUnused = 0;
    keys(language).forEach(key => {
        if (key === "") {
            return;
        }
        if (!translationStringCopy.has(key)) {
            console.warn(chalk.yellowBright(`Unused translation key in ${gray(languageName)}: ${chalk.white(`"${key}"`)}`));
            numUnused++;
            return;
        }
        translationStringCopy.delete(key);
    });
    translationStringCopy.forEach(key => {
        console.error(chalk.redBright(`Missing translation in ${gray(languageName)}: ${chalk.white(`"${key}"`)}`));
    });
    if (numUnused === 0 && translationStringCopy.size === 0) {
        console.log(chalk.green(`All translations seem fine in ${gray(languageName)}`));
    }
    if (numUnused > 0) {
        console.warn(chalk.yellowBright(`${numUnused} unused translations in ${gray(languageName)}`));
    }
    if (translationStringCopy.size > 0) {
        hasMissingTranslations = true;
        console.error(chalk.redBright(`${translationStringCopy.size} missing translations in ${gray(languageName)}`));
    }
});

process.exit(hasMissingTranslations ? 1 : 0);