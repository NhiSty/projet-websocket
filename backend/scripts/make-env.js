const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const fromFilePath = path.join(__dirname, '../.env.example'); // Path to the source .env.example file
const toFilePath = path.join(__dirname, '../.env'); // Path to the destination .env file

function generateRandomValue() {
  return crypto.randomBytes(32).toString('hex');
}

async function makeEnv() {
  try {
    // Read the content of the source .env file
    const data = await fs.readFile(fromFilePath, 'utf8');

    // Update the APP_SECRET variable with the random value
    const randomSecret = generateRandomValue();
    const updatedData = data.replace(/(APP_SECRET=)(.*)/, `$1${randomSecret}`);

    // Write the updated content to the destination .env file
    await fs.writeFile(toFilePath, updatedData, 'utf8');
    console.log('.env file copied and updated successfully!');
  } catch (err) {
    console.error('Error reading or writing .env file:', err);
  }
}

makeEnv();
