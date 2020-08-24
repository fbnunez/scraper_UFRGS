const fetch = require('node-fetch');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const date = new Date();

const BASE_URL =
  'https://www1.ufrgs.br/PortalEnsino/GraduacaoProcessoSeletivo/index.php/DivulgacaoDadosChamamento';

// getting admission data
// obj key is the admission code for body data
async function getAdmissionType(anoSelecao = date.getFullYear()) {
  const admissionObject = {};
  admissionObject[anoSelecao] = {};
  const response = await fetch(`${BASE_URL}/carregaConcursos`, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset: ISO-8859-1',
    },
    body: `anoSelecao=${anoSelecao}`,
    method: 'POST',
  });

  let text = await response.text();
  const $ = cheerio.load(text, { decodeEntities: false });
  $('option').each((i, element) => {
    if (i === 0) return;
    const cheerioElement = $(element);
    const tagValue = cheerioElement.attr('value').toString();
    let textElement = cheerioElement.text().trim();
    textElement = iconv.decode(Buffer.from(textElement), 'utf-8');
    admissionObject[anoSelecao][tagValue] = textElement;
  });
  return admissionObject;
}

async function getCollegeCourseType(
  anoSelecao = date.getFullYear(),
  sequenciaSelecao = 'S'
) {
  const collegeCourseObject = {};
  const response = await fetch(`${BASE_URL}/carregaCursos`, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `anoSelecao=${anoSelecao}&sequenciaSelecao=${sequenciaSelecao}`,
    method: 'POST',
  });
  let text = await response.text();
  const $ = cheerio.load(text, { decodeEntities: false });
  $('select[id=selectCurso]')
    .find('option')
    .each((i, element) => {
      if (i === 0) return;
      const cheerioElement = $(element);
      const tagValue = cheerioElement.attr('value').toString();
      let textElement = cheerioElement.text().trim();
      textElement = iconv.decode(Buffer.from(textElement), 'utf-8');
      collegeCourseObject[tagValue] = textElement;
    });
  return collegeCourseObject;
}

async function getAdmissionResults(
  anoSelecao = '2019',
  sequenciaSelecao = 'S',
  codListaSelecao = '2379'
) {
  const admissionResultsObject = {};
  const response = await fetch(`${BASE_URL}/carregaDadosDivulgacao`, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: `anoSelecao=${anoSelecao}&sequenciaSelecao=${sequenciaSelecao}&codListaSelecao=${codListaSelecao}`,
    method: 'POST',
  });
  let text = await response.text();
  const $ = cheerio.load(text, { decodeEntities: false });
  $('table')
    .find('tr')
    .each((i, element) => {
      let studentRegistrationId;
      if (i === 0) return;
      $(element)
        .find('td')
        .each((j, row) => {
          const rowElement = $(row);
          // console.log(j, rowElement.text());
          if (j === 0) {
            studentRegistrationId = rowElement.text();
            admissionResultsObject[studentRegistrationId] = {};
            return;
          }
          admissionResultsObject[studentRegistrationId][j] = rowElement.text();
        });
    });
  console.log(admissionResultsObject);
  return admissionResultsObject;
}

getAdmissionResults();
