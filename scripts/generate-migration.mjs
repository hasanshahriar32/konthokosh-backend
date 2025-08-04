/* eslint-disable no-undef */
// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import process from 'process';

const drizzleDir = path.join(process.cwd(), 'drizzle');
const metaDir = path.join(drizzleDir, 'meta');
const journalPath = path.join(metaDir, '_journal.json');
const vectorExtensionSql = "CREATE EXTENSION IF NOT EXISTS vector;\n";
const vectorIndexSql = "\nCREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);";

async function run() {
    console.log('Running drizzle-kit generate...');
    let generateOutput = '';
    let generateSuccess = false;
    try {
        await fs.mkdir(metaDir, { recursive: true });

        try {
            await fs.access(journalPath);
        } catch {
            console.log('Journal file not found, creating empty journal.');
            await fs.writeFile(journalPath, JSON.stringify({ version: "6", dialect: "postgresql", entries: [] }, null, 2), 'utf-8');
        }

        generateOutput = execSync('npx drizzle-kit generate', { encoding: 'utf-8', stdio: 'pipe' });
        console.log(generateOutput);
        generateSuccess = true;
    } catch (error) {
        generateOutput = error.stdout?.toString() || error.stderr?.toString() || '';
        console.error('Error running drizzle-kit generate:');
        console.error(generateOutput || error.message);
    }

    if (generateOutput.includes('No schema changes')) {
        console.log('No schema changes detected. No migration file to modify.');
        return;
    }

    if (!generateSuccess && !generateOutput.includes('Created migration file')) {
         console.error('drizzle-kit generate failed and did not report creating a file. Aborting modification.');
         return;
    }

    let latestMigrationFile;
    try {
        const journalContent = await fs.readFile(journalPath, 'utf-8');
        const journal = JSON.parse(journalContent);
        if (journal.entries && journal.entries.length > 0) {
            const latestEntry = journal.entries.reduce((latest, current) =>
                current.idx > latest.idx ? current : latest
            );
            latestMigrationFile = `${latestEntry.tag}.sql`;
            console.log(`Detected latest migration file from journal: ${latestMigrationFile}`);
        } else {
             console.warn('No migration entries found in journal. Attempting to find latest .sql file.');
             const files = await fs.readdir(drizzleDir);
             const sqlFiles = files.filter(f => f.endsWith('.sql') && /^\d{4}_/.test(f));
             if (sqlFiles.length > 0) {
                 sqlFiles.sort();
                 latestMigrationFile = sqlFiles[sqlFiles.length - 1];
                 console.log(`Found latest migration file by name: ${latestMigrationFile}`);
             } else {
                console.error('Could not determine the new migration file.');
                return;
             }
        }
    } catch (error) {
        console.error(`Error reading or parsing journal file ${journalPath}:`, error);
        console.error('Cannot reliably determine the migration file to modify.');
        return;
    }

    if (!latestMigrationFile) {
        console.error('Failed to identify the migration file to modify.');
        return;
    }

    const migrationFilePath = path.join(drizzleDir, latestMigrationFile);

    try {
        console.log(`Checking/Modifying migration file: ${migrationFilePath}`);
        let content = await fs.readFile(migrationFilePath, 'utf-8');
        let modified = false;

        if (!content.trim().startsWith(vectorExtensionSql.trim())) {
            console.log('Prepending vector extension SQL...');
            content = vectorExtensionSql + content;
            modified = true;
        } else {
             console.log('Vector extension SQL already present.');
        }

        if (!content.includes(vectorIndexSql.trim())) {
            console.log('Appending vector index SQL...');
            content += vectorIndexSql;
            modified = true;
        } else {
             console.log('Vector index SQL already present.');
        }

        if (modified) {
            await fs.writeFile(migrationFilePath, content, 'utf-8');
            console.log(`Successfully updated ${latestMigrationFile}`);
        } else {
            console.log(`${latestMigrationFile} already contains the required custom SQL.`);
        }

    } catch (error) {
        console.error(`Error reading or writing migration file ${migrationFilePath}:`, error);
    }
}

run().catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
});