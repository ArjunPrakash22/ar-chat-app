import React, { useState } from 'react';
import FileBase64 from 'react-file-base64';
import Tesseract from 'tesseract.js';

const UploadCard = () => {
    const [image, setImage] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [name, setName] = useState('');
    const [inputName, setInputName] = useState('');
    const [uniqueId, setUniqueId] = useState('');
    const [inputUniqueId, setInputUniqueId] = useState('');

    const handleFileUpload = (file) => {
        setImage(file.base64);
        performOCR(file.base64);
    };

    // Perform OCR using Tesseract.js
    const performOCR = (imgBase64) => {
        Tesseract.recognize(
            imgBase64,
            'eng',
            { logger: (m) => console.log(m) }
        )
        .then(({ data: { text } }) => {
            console.log('OCR Text:', text);
            setExtractedText(text);
            extractDetails(text);  // Extract name and ID from text
        })
        .catch(err => console.error(err));
    };

    // Clean and extract name and unique ID
    const extractDetails = (text) => {
        // Step 1: Clean up the text to remove noise
        const cleanedText = text
            .replace(/[^\w\s\.\-\/:]/g, '')  // Remove special characters except certain ones
            .replace(/\s+/g, ' ')             // Normalize spacing
            .trim();

        // Step 2: Identify the Aadhaar number (12-digit pattern)
        const idPattern = /\b\d{4}\s\d{4}\s\d{4}\b/;
        const idMatch = cleanedText.match(idPattern);
        setUniqueId(idMatch ? idMatch[0] : 'Not found');

        // Step 3: Extract probable name based on heuristic rules
        const namePattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/g; // Look for capitalized names
        const nameMatch = cleanedText.match(namePattern);

        // If we found matches, pick the one that looks most like a name
        if (nameMatch && nameMatch.length > 0) {
            const fullName = nameMatch[0].trim();  // Get the first full name match
            setName(fullName || 'Not found');
        } else {
            setName('Not found');
        }

        console.log('Cleaned Text:', cleanedText);
        console.log('Aadhaar Number:', idMatch ? idMatch[0] : 'Not found');
        console.log('Probable Name:', nameMatch ? nameMatch[0] : 'Not found');
    };

    const matchInputWithOCR = () => {
        // Normalize the names for comparison
        const normalizedExtractedName = name.replace(/\s+/g, ' ').trim();
        const normalizedInputName = inputName.replace(/\s+/g, ' ').trim();

        if (normalizedInputName === normalizedExtractedName && inputUniqueId === uniqueId) {
            alert('Name and Unique ID matched with OCR data!');
        } else {
            alert('Name or Unique ID did not match the extracted data.');
        }
    };

    return (
        <div>
            <h1>ID Card Verification</h1>
            <FileBase64 multiple={false} onDone={handleFileUpload} />
            {image && <img src={image} alt="Uploaded Identity Card" style={{ width: '300px' }} />}
            
            {extractedText && (
                <div>
                    <h2>Extracted Text</h2>
                    <p>{extractedText}</p>
                </div>
            )}

            {/* Display extracted name and unique ID in input fields */}
            <div>
                <label>Name (OCR Extracted):</label>
                <input 
                    type="text" 
                    value={name} 
                    readOnly 
                />

                <label>Unique ID (OCR Extracted):</label>
                <input 
                    type="text" 
                    value={uniqueId} 
                    readOnly 
                />
            </div>

            {/* Editable input fields for manual entry */}
            <div>
                <label>Enter Name:</label>
                <input 
                    type="text" 
                    value={inputName} 
                    onChange={(e) => setInputName(e.target.value)} 
                />

                <label>Enter Unique ID:</label>
                <input 
                    type="text" 
                    value={inputUniqueId} 
                    onChange={(e) => setInputUniqueId(e.target.value)} 
                />

                <button onClick={matchInputWithOCR}>Match Input with OCR</button>
            </div>
        </div>
    );
};

export default UploadCard;
