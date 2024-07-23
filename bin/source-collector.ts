import { Project, SourceFile } from "ts-morph";
import glob from "fast-glob";
import { readFile } from "fs/promises";
import * as vueCompiler from '@vue/compiler-sfc';
import path from 'path';

export async function addSourceFiles(project: Project) {
    const globSourceFile = 'src/**/*.{d.ts,js?(x),ts?(x),vue}'
    const filePaths = await glob([globSourceFile], {
        cwd: process.cwd(),
        absolute: true,
        onlyFiles: true,
    });

    const sourceFiles: SourceFile[] = []
    await Promise.all([
        ...filePaths.map(async (file) => {
            if (file.endsWith('.vue')) {
                const content = await readFile(file, 'utf-8')
                const hasTsNoCheck = content.includes('@ts-nocheck')

                const sfc = vueCompiler.parse(content)
                const { script, scriptSetup } = sfc.descriptor
                if (script || scriptSetup) {
                    let content =
                        (hasTsNoCheck ? '// @ts-nocheck\n' : '') + (script?.content ?? '')

                    if (scriptSetup) {
                        const compiled = vueCompiler.compileScript(sfc.descriptor, {
                            id: 'xxx',
                            inlineTemplate: true,
                        })
                        content += compiled.content
                    }

                    const lang = scriptSetup?.lang || script?.lang || 'js'
                    const sourceFile = project.createSourceFile(
                        `${path.relative(process.cwd(), file)}.${lang}`,
                        content
                    )
                    sourceFiles.push(sourceFile)
                }
            } else {
                const sourceFile = project.addSourceFileAtPath(file)
                sourceFiles.push(sourceFile)
            }
        }),
    ])

    return sourceFiles
}