const path = require("path");
const fs = require("fs").promises;
const { JSDOM } = require("jsdom");

const readHtmlFileAsArray = async () => {
  try {
    const filePath = path.join(__dirname, "../files/index.html");

    const data = await fs.readFile(filePath, "utf8");

    const lines = data.split("\n");

    const mainIndex = lines.findIndex((line) => line.includes("<main>"));

    if (mainIndex !== -1) {
      return lines.slice(mainIndex);
    } else {
      throw new Error("Tag <main> não encontrada no arquivo HTML");
    }
  } catch (err) {
    throw err;
  }
};

const extractSpanValueFromLine1 = (line) => {
  const spanRegex =
    /<span class="profit ps-2 cursor-help"[^>]*>([^<]*)<\/span>/;
  const match = spanRegex.exec(line);
  if (match) {
    return match[1].trim();
  }
  return null;
};

const extractSpanValueFromLine2 = (line) => {
  const spanRegex = /<span class="age ps-2 cursor-help"[^>]*>([^<]*)<\/span>/;
  const match = spanRegex.exec(line);
  if (match) {
    return match[1].trim();
  }
  return null;
};

const extractLinkText = (html) => {
  // Expressão regular para encontrar o texto dentro da tag <a>
  const regex = /<a[^>]*href="[^"]*"[^>]*>([^<]*)<\/a>/;

  // Executa a expressão regular na string HTML
  const match = regex.exec(html);

  // Retorna o texto da tag <a>, se encontrado
  return match ? match[1].trim() : null;
};

const extractDataUtcFromLine = (line) => {
  // Expressão regular para encontrar o número dentro das aspas
  const regex = /data-utc="(\d+)"/;

  // Executa a expressão regular na string
  const match = regex.exec(line);

  // Retorna o número como string, se encontrado
  return match ? match[1] : null;
};

const convertTimestampToBrazilianDateTime = (timestamp) => {
  const date = new Date(parseInt(timestamp, 10));

  const options = {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleString("pt-BR", options);

  const [day, month, yearAndTime] = formattedDate.split("/");
  const [year, time] = yearAndTime.split(", ");

  return `${day}/${month}/${year}`;
};

const isNumber = (input) => {
  const trimmedInput = input.trim();
  const parsedNumber = parseFloat(trimmedInput);
  if (!isNaN(parsedNumber)) {
    return true;
  } else {
    return false;
  }
};

function getTitleFromHtmlString(htmlString) {
  // Cria uma instância de JSDOM a partir da string HTML
  const dom = new JSDOM(htmlString);

  // Seleciona o elemento abbr no documento
  const abbrElement = dom.window.document.querySelector("abbr");

  // Verifica se o elemento existe e tem o atributo 'title'
  if (abbrElement && abbrElement.hasAttribute("title")) {
    // Retorna o valor do atributo 'title'
    return abbrElement.getAttribute("title");
  } else {
    // Retorna null ou uma mensagem de erro caso o elemento não exista ou não tenha o atributo 'title'
    return null;
  }
}

const extractLinkText1 = (html) => {
  // Expressão regular para encontrar o texto dentro da tag <a>, incluindo o caso de tag não fechada
  const regex = /<a[^>]*href="[^"]*"[^>]*>([^<]*)/;

  // Executa a expressão regular na string HTML
  const match = regex.exec(html);

  // Retorna o texto da tag <a>, se encontrado
  return match ? match[1].trim() : null;
};

async function isDateAfterTwoHours(dateString) {
  // Converter a string para um objeto Date
  let [datePart, timePart] = dateString.split(' ');
  let [day, month, year] = datePart.split('/');
  let [hours, minutes] = timePart.split(':');
  let date = new Date(year, month - 1, day, hours, minutes);

  // Obter a data atual
  let now = new Date();

  // Ajustar a data atual para duas horas no futuro
  let nowPlusTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Validar se a data é depois de duas horas da data atual
  return date > nowPlusTwoHours;
}


const readAndLogHtmlFile = async () => {
  try {
    const lines = await readHtmlFileAsArray();
    const searchString1 = '<span class="profit ps-2 cursor-help';
    const searchString2 = '<span class="age ps-2 cursor-help';
    const searchString3 = "data-utc=";
    const searchString4 = "/nav/surebet/prong/0/";
    const searchString4part2 = "/nav/surebet/prong/1/";
    const searchString5 = "/nav/bookie/";
    const searchString6 = '<td class="coeff">';
    const searchString7 = '<span class="minor">';
    const searchString7part2 = "</span>";
    let mensagens = [];

    temp = {};
    let loopTemp = 0;
    for (const [index, line] of lines.entries()) {
      if (line.trim().startsWith(searchString1)) {
        const lineTemp = extractSpanValueFromLine1(line);
        temp["ganho"] = lineTemp;
      }

      if (line.trim().startsWith(searchString2)) {
        const lineTemp = extractSpanValueFromLine2(line);
        temp["descoberta"] = lineTemp;
      }

      if (line.trim().startsWith(searchString3)) {
        const lineTemp = convertTimestampToBrazilianDateTime(
          extractDataUtcFromLine(line)
        );
        temp["data"] = lineTemp;
      }

      if (line.trim().includes(searchString4)) {
        const lineTemp = extractLinkText(line.trim());
        if (isNumber(lineTemp) === true) {
          temp["old1"] = parseFloat(lineTemp.trim());
        } else {
          temp["jogo"] = lineTemp;
        }
      }

      if (line.trim().includes(searchString4part2)) {
        const lineTemp = extractLinkText(line.trim());
        if (isNumber(lineTemp) === true) {
          temp["old2"] = parseFloat(lineTemp.trim());
        } else {
          temp["jogo"] = lineTemp;
        }
      }

      if (line.trim().includes(searchString5)) {
        let lineTemp = extractLinkText(line);
        if (lineTemp === null) {
          lineTemp = extractLinkText1(lines[index]);
        }
        if (temp["bet1"]) {
          temp["bet2"] = lineTemp;
        } else {
          temp["bet1"] = lineTemp;
        }
      }

      if (line.trim().includes(searchString6)) {
        const lineTemp = getTitleFromHtmlString(lines[index + 1]);
        if (temp["bet1"] && !temp["bet2"]) {
          temp["fazer1"] = lineTemp;
        } else {
          temp["fazer2"] = lineTemp;
        }
      }

      if (
        line.trim().includes(searchString7) &&
        !line.trim().includes(searchString7part2)
      ) {
        temp["modalidade"] = lines[index + 1].trim();
      }

      if (line.trim().includes('data-formula="bookformula1"')) {
        if (loopTemp > 0) {
          let strWithoutPercentage = temp.ganho.replace(/%/g, '');
          let result = strWithoutPercentage.replace(/,/g, '.');
          if (result > 10 || await isDateAfterTwoHours(temp.data) === false ) { 
            mensagens.push(temp);
          }
          temp = {};
        }
        loopTemp += 1;
      }
    }
    if (temp["jogo"]) {
      mensagens.push(temp);
    }
    return mensagens;
  } catch (err) {
    console.error("Erro ao ler o arquivo HTML:", err);
    return [];
  }
};

module.exports = readAndLogHtmlFile;
