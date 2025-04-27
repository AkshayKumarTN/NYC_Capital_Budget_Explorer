import { ObjectId } from 'mongodb';
import { projects } from '../config/mongoCollections.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Export data as CSV
export const exportToCSV = async () => {
    const projectCollection = await projects();
    const data = await projectCollection.find({}).toArray();

    if (data.length === 0) {
        throw new Error('No projects found to export');
    }

    const fields = Object.keys(data[0]);
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const exportDir = path.join('public', 'exports');
    fs.mkdirSync(exportDir, { recursive: true });

    const filePath = path.join(exportDir, 'projects.csv');
    fs.writeFileSync(filePath, csv);

    return filePath;
};

// Export data as PDF
export const exportToPDF = async () => {
    const projectCollection = await projects();
    const data = await projectCollection.find({}).toArray();

    if (data.length === 0) {
        throw new Error('No projects found to export');
    }

    const exportDir = path.join('public', 'exports');
    fs.mkdirSync(exportDir, { recursive: true });

    const filePath = path.join(exportDir, 'projects.pdf');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    data.forEach((item, index) => {
        doc.text(`${index + 1}: ${JSON.stringify(item)}`, { paragraphGap: 10 });
    });

    doc.end();

    return filePath
};