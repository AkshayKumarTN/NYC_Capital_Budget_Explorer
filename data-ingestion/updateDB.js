// File: data-ingestion/updateDB.js

import {projects} from '../config/mongoCollections.js';




export async function updateDB(enriched) {
 try{
    const collection = await projects();
    await collection.insertMany(enriched, { ordered: false }); // continues inserting even if some fail
 } catch (error) {
    throw new Error(`Error updating database: ${error.message}`);
 }
}