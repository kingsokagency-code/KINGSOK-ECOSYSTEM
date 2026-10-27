import { spawn } from 'child_process';
import http from 'http';

console.log('Spawning dev server...');
const child = spawn('cmd.exe', ['/c', 'npm.cmd run dev'], { stdio: 'pipe' });

let port = 3000;
child.stdout?.on('data', (d: Buffer) => {
  const s = d.toString();
  const m = s.match(/http:\/\/localhost:(\d+)/);
  if (m) port = parseInt(m[1], 10);
});

function test(attempts: number) {
  if (attempts <= 0) {
    child.kill();
    process.exit(1);
  }
  setTimeout(() => {
    http.get(`http://localhost:${port}/contacts`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('Contacts page received. Status:', res.statusCode);
        const cssMatches = body.match(/href=["'][^"']+\.css[^"']*["']/g);
        console.log('CSS links in HTML:', cssMatches);

        if (cssMatches && cssMatches.length > 0) {
          const href = cssMatches[0].replace(/href=["']/, '').replace(/["']$/, '');
          console.log('Testing CSS fetch on:', href);
          http.get(`http://localhost:${port}${href}`, (cssRes) => {
            console.log('CSS HTTP status:', cssRes.statusCode);
            console.log('CSS Content-Type:', cssRes.headers['content-type']);
            let cssBody = '';
            cssRes.on('data', (c) => (cssBody += c));
            cssRes.on('end', () => {
              console.log('CSS body length:', cssBody.length);
              console.log('CSS sample:', cssBody.slice(0, 150));
              child.kill();
              process.exit(0);
            });
          });
        } else {
          console.log('NO CSS LINKS FOUND IN HTML!');
          child.kill();
          process.exit(0);
        }
      });
    }).on('error', () => test(attempts - 1));
  }, 2000);
}

test(20);
