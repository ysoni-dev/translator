
import express from 'express';
import bodyParser from 'body-parser';
import translate from 'translate-google';
import langdetect from 'langdetect';

const app = express();
const port = process.env.PORT || 3000;

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

        if (!textToTranslate) {
            return res.status(400).json({ error: 'Text is required in the request body.' });
        }

        const detectedLanguage = langdetect.detectOne(textToTranslate);

        if (detectedLanguage === 'fr') {
            return res.json({
                message: 'The provided text is already in French.',
                originalText: textToTranslate,
                translatedText: textToTranslate
            });
        }

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
