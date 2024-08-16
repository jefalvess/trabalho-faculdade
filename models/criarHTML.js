require("dotenv").config();
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

async function saveHtml(response) {

  const tempDir = path.join(__dirname, "../files");
  const filePath = path.join(tempDir, 'index.html');

  try {
      try {
        await fs.access(tempDir);
      } catch (err) {
        await fs.mkdir(tempDir, { recursive: true });
      }

    await fs.writeFile(filePath, response.data, 'utf8');
    
    return false; // Retorna apenas após a escrita bem-sucedida
  } catch (err) {
    console.error('Error saving HTML:', err);
    return false; // Retorna após um erro de escrita
  }
}

async function fetchAndSaveHtml(url) {
  try {
    const headers = {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      cookie: "uu=e44500ee-8083-4fb7-a117-df4e54517dfa; ab=582; timezoneOffset=180; browser.timezone=America/Sao_Paulo; timezoneOffset=180; _ga=GA1.2.1314313991.1722114496; _gid=GA1.2.907722579.1722114496; ad_checker=2024-07-28; sel.surebets=55afd23db493f0bd573a5295006fd6db; remember_user_token=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaGJDRnNHYVFNZDhRUkpJaGx3VTBkU09VNU1UbnB6YzNWb2R6WjFZM3BJUndZNkJrVlVTU0lYTVRjeU1qSTFPVEV3TVM0NU5qSXdPRE16QmpzQVJnPT0iLCJleHAiOiIyMDI3LTA3LTI5VDEzOjE4OjIxLjk2MloiLCJwdXIiOm51bGx9fQ%3D%3D--362f5e621f1e366acfc0838f69fcf8b1226918a2; order_valuebets_index=probability_asc; calculator.auto.height=1001; calculator.auto.width=1724; cf_clearance=If_JglIEw_OaJOFnqac.Z3IajUrR.0_ahkKCEUSmGSs-1722427626-1.0.1.1-ZotxY3LIpebx6__mTPSuoOymrbR3yWFrOdRE_S_WfcEo81hC42O_cJl4FAL6VpPMqatrfH6R602VDbiwSHB4OA; order_surebets_index=start_at_asc; stoken=28708857-b328ad1fe94db963f29caf43b2afe0c066d8b91e; _gat_gtag_UA_1803143_12=1; _ga_4H2DFG8NDS=GS1.2.1722530661.21.1.1722531433.0.0.0; sstoken=28708857-b328ad1fe94db963f29caf43b2afe0c066d8b91e-28708857-86246c39cbdec2369756efc7efa294c6b2cf1c38; ref=TXJsZm84YTRFUStDY0g3MmNsMlpFa3JETG05RHdOZ2lIc2lhbXdZeFpISkNaeTZpZjZ6Z2ZNUkRaY3FtOHhPM3MxcHhPVmxNdVVUT29UVTh6cmllREcxbTlISTd0enFQVmxMYlM3ZFIzVituZVJ4UTZ5SUNEdWVOOU8zaFZOS3MtLXlxQnFmcXhqTERqam5Eb3V6eEZCeFE9PQ%3D%3D--bf96cbbfee41c593538f035b396c989717cabe56; br=WCtZdDA0YzBQeUgrdlROQTk3ZjdTTHd0WUJaNmwyLzBta3pVSlZUTUFvd0dkb1BmRERzOHBEMlVMWTlCc2w0d0lWdDlUNzFTNkJNTXBuMldXYkhtRmpPbkU4a2ZnOFVpbDI0Ry9YN2JqMFlwOVh2UHR4SndpZC92K1lzcFcvNXlHb0ZCVTYyRE5jSkgwVkRzdmQ3alRYdmVtbjZubVNQcmlrRUlBTGtiN3ZIcUwydUNvanZ0cGFhN0dVeEpFNlBnaDJMTW1kbGRyd2RDV3czaldwUS9WYVo4b3lHdGlHcmxPY0wvN1h5dUZyOD0tLWh5Mk5tM2Q1bVFhUXErK253Y1lDQlE9PQ%3D%3D--bf75582b4653300c728a1df4298788acbd6d250d; _sp5=REtvQVpGSzZHY3N5akJrTUcyc2loYUI5bjBNYWZENFcxWnZMMmh0eXJWNDFZM1ZTQTl3UmRGY3pFQU1JSjViV2c4Z2NnZ1ljbWxQR0pxL3pGOUZsS09VRWlwNVJlSXIzbkU2cjVBcGgzcm1ZOEo4N1VyM3JmSi9QaG5NWENGVTdzNitqTVNMTExTTkNqS2QxSG43VXpXMjdZRTdPdW1aSUhhRUZyQU8yZWlCTmFtaU1IbVdtOEZheFUwNWU1dUtkcSszME91MzZXT285bW5qYWs1VDNVTXhUblllMzNyVFQ5eGl4UG12bHRvTzJzTkI1T1hOai8xd0swSndVdzRML0E1cTkzMjFoWWkrVm9wYzFBbVJRTDRpR1JYbEpUYm1mcHVCM1lIY1BKRzNuMEZmUUU1QjNMVkxLdS9ZMnJEdkR6K2pabjY3WmdpMDIveVdQTVA1cWFGYUIxN3FXd3dSUHFlUkZZcEhReC9EWmh0SlpIcURYUUp0bWs2c1FZL1J0LS1HTGNQT0tybjFvTmRkanBoZS9xNUlnPT0%3D--e2ba43dc8db6751858d9cd2484658577619f2fb2"
      };
    const response = await axios.get(url, { headers });
    const result = await saveHtml(response);
    return result;
  } catch (error) {
    console.error("Erro ao fazer a requisição ou salvar o arquivo:", error);

    saveErrorToFile(error)
  }
}


function saveErrorToFile(error) {
  const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
  fs.writeFile('./error_log.txt', errorString, (err) => {
    if (err) {
      console.error('Erro ao salvar o arquivo:', err);
    } else {
      console.log('Erro salvo no arquivo error_log.txt');
    }
  });
}

module.exports = fetchAndSaveHtml;
