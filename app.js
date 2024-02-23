const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const translate = require('translate-google')
// const langdetect = require('langdetect')
require('dotenv').config()

const app = express();

const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())
app.use(bodyParser.json());

app.get('/', async function (req, res) {
    try {
        await homepage(req, res)
    } catch (error) {
        console.log(error)
    }
})

const homepage = async (req, res) => {
    try {
        res.send('Type /translate in the URL to get results.');
    } catch (error) {
        console.log(error)
    }
}




// api for translating the text

app.post('/translate', async function (req, res) {
    try {
        await textTranslate(req, res)
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'error processing translator.' })
    }
})

const textTranslate = async (req, res) => {
    try {
        const textToTranslate = req.body.text;

        if (textToTranslate === null || typeof textToTranslate !== 'string' || !textToTranslate.trim()) {
            return res.status(400).json({ error: 'Text is required in the request body and must be a non-empty string.' });
        }

        // Check if the content is numeric or not translatable
        if (/^\d+$/.test(textToTranslate)) {
            return res.json({
                message: 'The provided text is invalid and cannot be translated.',
                originalText: textToTranslate,
                translatedText: textToTranslate
            });
        }

        const detectedLanguage = langdetect.detectOne(textToTranslate);


        // uncomment the below code for running in you local to get this feature
        // if (detectedLanguage === 'fr') {
        //     return res.json({
        //         message: 'The provided text is already in French.',
        //         originalText: textToTranslate,
        //         translatedText: textToTranslate
        //     });
        // }
        

        const translation = await translate(textToTranslate, { to: 'fr' });

        if (!translation) {
            return res.status(500).json({ error: 'Translation failed.' });
        }

        res.json({ originalText: textToTranslate, translatedText: translation });
    } catch (error) {
        console.error(error);

        if (error instanceof SyntaxError) {
            return res.status(400).json({ error: 'Invalid JSON in the request body.' });
        }

        res.status(500).json({ error: 'Internal server error.' });
    }
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
