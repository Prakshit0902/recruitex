import { Pool } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const runMigration = async () => {
    try {
        const pool = new Pool({ connectionString: process.env.DB_URL });
        const sqlPath = path.join(process.cwd(), "tables.sql");
        console.log(`Reading SQL file from: ${sqlPath}`);
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");

        console.log("Running migration...");
        // Pool allows executing raw strings
        await pool.query(sqlContent);

        console.log("Migration completed successfully.");
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

runMigration();
