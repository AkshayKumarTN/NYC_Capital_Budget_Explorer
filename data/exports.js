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
        throw 'No projects found to export';
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


// Function to return a default value (dash) for empty fields
const getFieldValue = async (value) => {
    return value && value !== '' ? value : '-';
};

// Export data as PDF with card layout for each project
export const exportToPDF = async () => {
    const projectCollection = await projects();
    const data = await projectCollection.find({}).toArray();

    if (data.length === 0) {
        throw 'No projects found to export';
    }

    // Define the export directory
    const exportDir = path.join('public', 'exports');

    // Ensure the export directory exists
    try {
        fs.mkdirSync(exportDir, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        throw 'Failed to create export directory';
    }

    const filePath = path.join(exportDir, 'projects.pdf');
    const doc = new PDFDocument();

    // Write the PDF to the file path
    try {
        doc.pipe(fs.createWriteStream(filePath));
    } catch (err) {
        console.error(`Error creating PDF file stream: ${err.message}`);
        throw 'Failed to create PDF file stream';
    }

    // Add a title for the PDF
    doc.fontSize(18).text('NYC Capital Budget Projects', { align: 'center' });
    doc.moveDown(1); // Move down to give space for the next section

    // Card styling properties
    const cardMargin = 20;
    const cardPadding = 10;
    const cardWidth = 500; // Card width
    const cardHeight = 275; // Increased card height to avoid overlap (more space for content)

    let yPosition = doc.y; // Current Y position (starting position for cards)

    // Function to draw a card with project details
    const drawCard = async (project, yPos) => {
        const {
            id, reported, fiscal_year, borough, borough_full,
            council_district, neighborhoods, sponsor, title,
            description, budget_line, award
        } = project;

        // Draw a rounded rectangle (card background)
        doc.rect(50, yPos, cardWidth, cardHeight)
            .lineWidth(1)
            .stroke('#000000')
            .fill('#f4f4f4');  // Light grey background

        // Add padding and text content inside the card
        const paddingX = 60; // Padding from the left
        let paddingY = yPos + cardPadding; // Padding from the top
        paddingY += 10;
        // Title with bold and larger font size for better visibility
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000')
            .text(`Project Title: ${await getFieldValue(title)}`, paddingX, paddingY, { width: cardWidth - 40 });
        const titleText = await getFieldValue(title);
        if (titleText.length > 40) {
            paddingY += 35;
        }
        else {
            paddingY += 30; // Increased space for description (since it's potentially longer)
        }

        // Description with regular font and color contrast
        doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(`Project Description: ${await getFieldValue(description)}`, paddingX, paddingY, { width: cardWidth - 40 });
        const descriptionText = await getFieldValue(description);
        if (descriptionText.length > 130) {
            paddingY += 35;
        }
        else if (descriptionText.length > 50) {
            paddingY += 30;
        }
        else {
            paddingY += 18; // Increased space for description (since it's potentially longer)
        }

        // Project Details (ID, Reported Fiscal Year, Fiscal Year, Borough, Sponsor, Award, etc.)
        doc.fontSize(10).font('Helvetica').fillColor('#333333')
            .text(`ID: ${await getFieldValue(id)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18; // Adjust position for next field

        doc.text(`Reported Fiscal Year: ${await getFieldValue(reported)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Fiscal Year: ${await getFieldValue(fiscal_year)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Borough (Code): ${await getFieldValue(borough)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Full Borough Name: ${await getFieldValue(borough_full)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Council District: ${await getFieldValue(council_district)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        // If there are neighborhoods, add them as well
        doc.text(`Neighborhoods: ${await getFieldValue(neighborhoods ? neighborhoods.join(', ') : '')}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Sponsor: ${await getFieldValue(sponsor)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Award Amount ($): ${await getFieldValue(award)}`, paddingX, paddingY, { width: cardWidth - 40 });
        paddingY += 18;

        doc.text(`Budget Line: ${await getFieldValue(budget_line)}`, paddingX, paddingY, { width: cardWidth - 40 });
    };

    // Loop through the data and render a card for each project
    for (const project of data) {
        // Check if we need to add a new page for the next card
        if (yPosition + cardHeight > 700) { // If the card won't fit, add a new page
            doc.addPage();
            yPosition = 50; // Reset Y position on new page
        }
    
        // Draw the project card
        await drawCard(project, yPosition);
    
        // Increase the Y position for the next card
        yPosition += cardHeight + cardMargin; // Add space between cards
    }

    // Finalize the document
    doc.end();

    console.log(`PDF successfully saved at: ${filePath}`);
    return filePath;
};


