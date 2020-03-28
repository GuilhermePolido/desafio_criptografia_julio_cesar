const axios = require('axios');
var fs = require('fs');

const TOKEN = '25150ce64c61922f4627985907420489dff8a5f8';
const BASE_URL = {
    generate: `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${TOKEN}`,
    submit: `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${TOKEN}`
};
const FILE = {
    name: 'answer',
    format: 'json'
}

const createFile = (content, callbackFunction) => {
    fs.writeFile(`${FILE.name}.${FILE.format}`, content, callbackFunction)
}

const contentFile =
    '{' +
        '"numero_casas": 102,' +
        '"token":"token_do_usuario",' +
        '"cifrado": "texto criptografado",' +
        '"decifrado": "aqui vai o texto decifrado",' +
        '"resumo_criptografico": "aqui vai o resumo"' +
    '}';

createFile(contentFile, () => console.log('File is created successfully'));
