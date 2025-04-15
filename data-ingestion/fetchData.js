import axios  from "axios";


// ========== PATH SETUP for logging==========
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const logFilePath = path.join(__dirname, 'log.txt');


const API_URL = 'https://data.cityofnewyork.us/resource/t474-a92g.json';

export async function fetchData(BATCH_SIZE, offset) {
    try{
        const { data } = await axios.get(API_URL, {
            params: { $limit: BATCH_SIZE, $offset: offset }
            });
        return data;
    }catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

