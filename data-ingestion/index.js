// Script to run both fetchData and updateDB.
import {closeConnection} from "../config/mongoConnection.js";

import { fetchData } from "./fetchData.js";
import { enrichData } from "../utils/helpers.js";
import { updateDB } from "./updateDB.js";



const BATCH_SIZE = 1000;
let offset = 0;
let allInserted = 0;

const runPipeline = async () => {
    while (true) {
        try {
        const data = await fetchData(BATCH_SIZE, offset);
        if (!data.length) break;

        const enriched = data.map(enrichData);
        await updateDB(enriched);

        console.log(`📦 Inserted batch ${offset}-${offset + BATCH_SIZE}`);
        offset += BATCH_SIZE;
        allInserted += enriched.length;
        } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        break;
        }
    }

    await closeConnection();
    console.log(`✅ Finished. Total inserted: ${allInserted}`);
};

runPipeline();