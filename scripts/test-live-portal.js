const https = require('https');

function fetchCandidate(regNumber, isDE = false) {
  return new Promise((resolve, reject) => {
    const path = isDE
      ? `/api/DirectEntryApplication/load-direct-entry-application-form?regNumber=${encodeURIComponent(regNumber)}`
      : `/api/PostUtme/load-application-form?regNumber=${encodeURIComponent(regNumber)}`;

    const options = {
      hostname: 'schmgrunn.azurewebsites.net',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': isDE
          ? 'https://unnportal.unn.edu.ng/direct_entry_application/preview'
          : 'https://unnportal.unn.edu.ng/putme_application_details',
        'Origin': 'https://unnportal.unn.edu.ng'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.end();
  });
}

async function run() {
  const candidates = [
    { reg: '202550664465CA', expectedDept: 'Computer Science' },
    { reg: '202550229776FF', expectedDept: 'Medicine' },
    { reg: '202551129716DA', expectedDept: 'Agriculture' },
  ];

  for (const c of candidates) {
    console.log(`\nFetching ${c.reg} (${c.expectedDept})...`);
    const res = await fetchCandidate(c.reg, false);
    if (res.data?.success && res.data?.data) {
      const d = res.data.data;
      console.log('-> Full Name:', d.postUtmeResponse?.fullName || d.personalInfoResponse?.surname);
      console.log('-> Department:', d.programmeInfoResponse?.department || d.postUtmeResponse?.department);
      console.log('-> Mobile Phone:', d.personalInfoResponse?.mobileNumber);
      console.log('-> Rate Limit remaining:', res.headers['x-rate-limit-remaining']);
    } else {
      console.log('-> Failed or not found:', res.data);
    }
    // Throttle to be respectful of UNN rate limits
    await new Promise((r) => setTimeout(r, 2000));
  }
}

run().catch(console.error);
