node server.js
node report.js
node transform.js

pa11y-ci -c config/breakfix.json --json > json-results/breakfix-results.json
pa11y-ci-reporter-html -s json-results/breakfix-results.json -d reports