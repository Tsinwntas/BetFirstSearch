# BetFirstSearch
#### EPL 660 Semester Project
**Guide:**

1. Install node on your machine using the official site.
2. Install elastic search using the guidelines of the course and have it running.
3. On the root folder open powershell and execute `node ./server.js`
	- It probably will throw errors telling you about missing libraries.
	- Execute `npm install` and if it still throws errors execute `npm install puppeteer`, `npm install @elastic/elasticsearch` and `npm install cheerio`. 
	- If it prompts for any more libraries feel free to download them.
4.  Right now the server should be running and crawling through the sites provided.
5. Execute `cd .\betfirstsearch\` to be directed to the website folder. 
	- Since it is in debugging mode and not production you need to run it as well.
6. It is written in angular so you need to execute `npm install` to install all missing modules.
7. Execute `ng serve` to compile the website.
8. Browse to [localhost:4200](localhost:4200) to visit the now compiled website.
9. Enjoy.
10. I like round numbers. 
