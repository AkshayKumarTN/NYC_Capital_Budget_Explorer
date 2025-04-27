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

    // Define the fields with more descriptive column names
    const fields = [
        { label: 'ID', value: 'id' },
        { label: 'Reported Fiscal Year', value: 'reported' },
        { label: 'Fiscal Year', value: 'fiscal_year' },
        { label: 'Borough (Code)', value: 'borough' },
        { label: 'Full Borough Name', value: 'borough_full' },
        { label: 'Council District', value: 'council_district' },
        { label: 'Neighborhoods', value: 'neighborhoods' },
        { label: 'Sponsor', value: 'sponsor' },
        { label: 'Project Title', value: 'title' },
        { label: 'Project Description', value: 'description' },
        { label: 'Budget Line', value: 'budget_line' },
        { label: 'Award Amount ($)', value: 'award' }
    ];

    // Map data to match the new fields
    const cleanedData = data.map(item => ({
        id: item.id || '',
        reported: item.reported || '',
        fiscal_year: item.fiscal_year || '',
        borough: item.borough || '',
        borough_full: item.borough_full || '',
        council_district: item.council_district || '',
        neighborhoods: item.neighborhoods ? item.neighborhoods.join(', ') : '',
        sponsor: item.sponsor || '',
        title: item.title || '',
        description: item.description || '',
        budget_line: item.budget_line || '',
        award: item.award || 0
    }));

    // Create the CSV parser with custom headers
    const parser = new Parser({ fields });
    const csv = parser.parse(cleanedData);

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