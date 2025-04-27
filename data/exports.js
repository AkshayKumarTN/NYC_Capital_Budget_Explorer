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


export const exportToPDF = async () => {
    const projectCollection = await projects();
    const data = await projectCollection.find({}).toArray();

    if (data.length === 0) {
        throw new Error('No projects found to export');
    }

    // Define the export directory
    const exportDir = path.join('public', 'exports');
    
    // Ensure the export directory exists
    try {
        fs.mkdirSync(exportDir, { recursive: true });
        console.log(`Directory created or already exists: ${exportDir}`);
    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        throw new Error('Failed to create export directory');
    }

    const filePath = path.join(exportDir, 'projects.pdf');
    const doc = new PDFDocument();
    
    // Write the PDF to the file path
    try {
        doc.pipe(fs.createWriteStream(filePath));
    } catch (err) {
        console.error(`Error creating PDF file stream: ${err.message}`);
        throw new Error('Failed to create PDF file stream');
    }

    // Add a title for the PDF
    doc.fontSize(18).text('NYC Capital Budget Projects', { align: 'center' });
    doc.moveDown(2); // Move down to give space for the next section

    // Add the table headers
    doc.fontSize(12).text('ID | Reported | Fiscal Year | Borough | Title | Sponsor | Award', { align: 'left' });
    doc.moveDown(0.5); // Move down slightly after the header

    // Iterate over the projects and add each project's data to the PDF
    data.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.id || 'N/A'} | ${item.reported || 'N/A'} | ${item.fiscal_year || 'N/A'} | ${item.borough_full || 'N/A'} | ${item.title || 'N/A'} | ${item.sponsor || 'N/A'} | $${item.award || 0}`, { align: 'left' });
        doc.moveDown(0.5); // Add some space between each project
    });

    // Finalize the document
    doc.end();

    console.log(`PDF successfully saved at: ${filePath}`);
    return filePath;
};