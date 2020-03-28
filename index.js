const axios = require('axios');
const fs = require('fs');
const sha1 = require('sha1');
var FormData = require('form-data');
const request = require("request");

const TOKEN = '25150ce64c61922f4627985907420489dff8a5f8';
const BASE_URL = 'https://api.codenation.dev/v1/challenge/dev-ps';
const URL = {
    generate: `${BASE_URL}/generate-data`,
    submit: `${BASE_URL}/submit-solution`
};
const FILE = {
    name: 'answer',
    format: 'json'
}
const STATUS_REQUEST = {
    ok: 200,
}

const CHAR_CODE = {
    space: 32,
    z: 122,
    A: 65,
    a: 97,
    Z: 90,
    ':': 58,
    '.': 46
}

const isValidValue = (value) => {
    return value && ((typeof value === 'string' && value.length > 0) || (typeof value === 'number'));
};

const decrypt = (cifrado, numero_casas) => {
    const num = numero_casas < 0 ? 26 : numero_casas;
    let decifrado = '';

    for (let i = 0; i < cifrado.length; i++) {
        const code = cifrado.charCodeAt(i);
        let char = '';

        if (code >= CHAR_CODE.A && code <= CHAR_CODE.Z) {
            char = String.fromCharCode((code - num) % CHAR_CODE.Z);
        } else if (code >= CHAR_CODE.a && code <= CHAR_CODE.z) {
            if (code - num < CHAR_CODE.a) {
                char = String.fromCharCode(code - num + CHAR_CODE.z - CHAR_CODE.a + 1);
            } else {
                char = String.fromCharCode(code - num);
            }
        } else {
            if (code === CHAR_CODE.space) {
                char = ' ';
            } else if (code === CHAR_CODE[':']) {
            char = String.fromCharCode(code);
            } else if (code === CHAR_CODE['.']) {
                char = String.fromCharCode(code);
            }
        }

        decifrado = decifrado.concat(char);
    }

    return decifrado;
}

const submit = () => {
    console.log('submit');
    const options = {
        method: "POST",
        url: `${URL.submit}?token=${TOKEN}`,
        headers: {
            "Content-Type": "multipart/form-data",
        },
        formData: {
            answer: fs.createReadStream(`${FILE.name}.${FILE.format}`),
        },
    };

    request(options, function(err, res, body) {
        if (err) console.log(err);
        console.log(body);
    });
}

const generateSha1 = (decifrado) => {
    return sha1(decifrado);
}

const finalWrite = (data) => {
    writeFile(JSON.stringify(data), () => {
        console.log('Writed in file the decrypted value');
        console.log('Writed in file the sh1 value');
        submit();
    })
}

const prepareSha1 = (data) => {
    const sh1 = generateSha1(data.decifrado);
    console.log(`Sh1: ${sh1}`);
    data.resumo_criptografico = sh1;
    finalWrite(data);
}

const prepareDecrypt = () => {
    fs.readFile(`${FILE.name}.${FILE.format}`, function (err, file) {
        if (err) throw err;
        console.log('File was read');
        const data = JSON.parse(file);
        const {numero_casas, token, cifrado} = data;
        if (
            isValidValue(numero_casas) &&
            isValidValue(token) &&
            isValidValue(cifrado)
        ) {
            console.log('File is valid');
            const decrypted = decrypt(cifrado, numero_casas);
            console.log(`Decrypted: ${decrypted}`);
            data.decifrado = decrypted;
            prepareSha1(data);
        }
      });
}

const writeFile = (content, callbackFunction) => {
    fs.writeFile(`${FILE.name}.${FILE.format}`, content, (err) => {
        if (err) throw err;
        callbackFunction();
    });
};

const generateData = () => {
    axios.get(URL.generate, {
        params: {
            token: TOKEN,
        }
    })
    .then(({status, data}) => {
        if (status === STATUS_REQUEST.ok) {
            writeFile(JSON.stringify(data), () => {
                console.log('File is created successfully')
                prepareDecrypt();
            });
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

const init = () => {
    generateData();
}

init();