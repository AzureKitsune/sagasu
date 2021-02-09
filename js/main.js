/* Hard coded list of supported websites and how to build their search urls. */
const SupportedWebsites = [
    {name: "AmiAmi", url: "https://www.amiami.com/eng/search/list/?s_keywords=%s", desc: "Character &amp; Hobby Shop"},
    {name: "Because.Moe", url: "https://because.moe/?q=%s", desc: "Anime Streaming Search Engine"},
    {name: "CrunchyRoll", url: "https://www.crunchyroll.com/search?from=&q=%s", short_name: "cr", desc: "Watch Popular Anime &amp; Read Manga Online"},
    {name: "FUNimation", url: "https://www.funimation.com/search/?q=%s", desc: "Watch Anime Streaming Online"},
    {name: "MyFigureCollection", url: "https://myfigurecollection.net/browse.v4.php?keywords=%s", short_name: "MFC", desc: "", whitespace: "+"},
    {name: "RightStuf", url: "https://www.rightstufanime.com/search?keywords=%s", desc: "Anime, Manga and More, for Less!"},
    {name: "Sentai Filmworks", url: "https://www.sentaifilmworks.com/a/search?q=%s", short_name: "Sentai", desc: "Shop The Sentai Filmworks Store"},
];

/* Event handler that fires when a user is typing into chrome/edgium's search box (when this extension is engaged). */
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
      var suggestions = [];
      //Loop through supported sites and build a list of suggestions to show.
      SupportedWebsites.forEach(function(site) {
        var desc = `Search for '${text}' on ${site['name']} - ${site["desc"]}`;
        var siteName = site["short_name"] ?? site["name"];
        var content = siteName.toLowerCase() + " " + text;
        suggestions.push({content: content, description: desc});
      });
      suggest(suggestions);
    });

/* Event handler that fires when the user presses enter on a search query suggestion (created in the event handler above). */
chrome.omnibox.onInputEntered.addListener(
    function(text) {
        //Given the query text "rightstuf search keywords", split it into ["rightstuf", "search keywords"]
        var [requestedSite, ...keywords] = text.split(' ');
        
        //Find the site with the given name/short-name specified in requestedSite
        var selectedSite = SupportedWebsites.find(site => {
            var siteName = site["short_name"] ?? site["name"];
            return siteName.toLowerCase() == requestedSite.trim().toLowerCase(); 
        });

        if (selectedSite !== undefined) {
            //Some sites use "+" to separate keywords instead of "%20"
            var whiteSpaceStr = selectedSite["whitespace"] ?? "%20";
            var keywordQueryText = keywords.join(whiteSpaceStr); //todo urlencode
            if (keywordQueryText == "") return;
            //Build the search query url.
            var siteUrl = selectedSite.url.replace("%s", keywordQueryText);
            //Open a new tab with the search query url.
            chrome.tabs.create({ url: siteUrl });
        }
    });