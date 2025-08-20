async function searchWiki() {
  const query = document.getElementById('query').value.trim();
  if (!query) return;

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "🔎 Searching...";

  try {
    // Step 1: Search Wikipedia for closest match
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`
    );
    const searchData = await searchRes.json();

    if (!searchData.query.search.length) {
      resultDiv.innerHTML = "❌ No results found.";
      return;
    }

    // Take first suggested title
    const title = searchData.query.search[0].title;

    // Step 2: Fetch summary of the best match
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    const summaryData = await summaryRes.json();

    resultDiv.innerHTML = `
      <h2>${summaryData.title}</h2>
      <p>${summaryData.extract}</p>
      ${summaryData.content_urls ? `<a href="${summaryData.content_urls.desktop.page}" target="_blank">Read more</a>` : ""}
      <br><small>Showing results for: <b>${title}</b></small>
    `;
  } catch (e) {
    resultDiv.innerHTML = "⚠️ Error fetching data.";
  }
}
