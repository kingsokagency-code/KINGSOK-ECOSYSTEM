const https = require('https');

function fetchCandidate(regNumber) {
  return new Promise((resolve) => {
    const url = 'https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form?regNumber=' + encodeURIComponent(regNumber);
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://unnportal.unn.edu.ng',
        'Referer': 'https://unnportal.unn.edu.ng/'
      },
      timeout: 20000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ httpStatus: res.statusCode, data: json });
        } catch(e) {
          resolve({ httpStatus: res.statusCode, parseError: e.message, raw: body.slice(0, 300) });
        }
      });
    });
    req.on('error', err => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'Timeout' }); });
  });
}

const testCandidates = [
  '202550757417JF', // Akigwe Chidiuso Elvis - Agribusiness
  '202550664465CA', // Ezisi Emmanuel Chibuike - Computer Science
  '202550229776FF', // Nzekwe Efechukwu Chinemerem - Medicine and Surgery
];

(async () => {
  console.log('Testing Live Retrieval for Real Candidates from UNN Admission List:\n');
  for (const reg of testCandidates) {
    console.log(`--- Querying ${reg} ---`);
    const res = await fetchCandidate(reg);
    if (res.data && res.data.success && res.data.data) {
      const d = res.data.data;
      const p = d.personalInfoResponse || {};
      const prog = d.programmeInfoResponse || {};
      const postUtme = d.postUtmeResponse || {};

      console.log('  SUCCESS: Candidate details retrieved!');
      console.log('  JAMB Reg Number :', d.regNumber);
      console.log('  Candidate Name  :', postUtme.fullName || `${p.surname} ${p.firstname} ${p.middlename}`.trim());
      console.log('  Department      :', prog.department || postUtme.department);
      console.log('  Phone Number    :', p.mobileNumber);
      console.log('  Email           :', p.email);
      console.log('  State / Origin  :', `${p.state} (${p.lga})`);
      console.log('  UTME Score      :', prog.utmeScore);
      console.log('  Form Completed  :', d.formCompleted);
    } else {
      console.log('  FAILED:', JSON.stringify(res, null, 2));
    }
    // Throttle 3 seconds between requests to avoid rate limit triggers
    await new Promise(r => setTimeout(r, 3000));
  }
})();
