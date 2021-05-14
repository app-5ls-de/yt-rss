function format(number) {
  // known SI prefixes
  var PREFIXES = {
    24: "Y",
    21: "Z",
    18: "E",
    15: "P",
    12: "T",
    9: "G",
    6: "M",
    3: "k",
    0: "",
    "-3": "m",
    "-6": "µ",
    "-9": "n",
    "-12": "p",
    "-15": "f",
    "-18": "a",
    "-21": "z",
    "-24": "y",
  };
  /* var PREFIXES = {
      6: "M",
      3: "k",
      0: "",
    }; */
  let maxExponent = Math.max(...Object.keys(PREFIXES).map(Number));

  function getExponent(n) {
    if (n === 0) {
      return 0;
    }
    return Math.floor(Math.log10(Math.abs(n)));
  }

  function precise(n) {
    return Number.parseFloat(n.toPrecision(2));
  }

  function toHumanString(sn) {
    // from https://www.npmjs.com/package/human-readable-numbers
    var n = precise(Number.parseFloat(sn));
    var e = Math.max(
      Math.min(3 * Math.floor(getExponent(n) / 3), maxExponent),
      -maxExponent
    );
    return precise(n / Math.pow(10, e)).toString() + PREFIXES[e];
  }

  if (Math.abs(number) >= 10000) return toHumanString(number);
  else return precise(number).toString();
}
/* 
let parser = new RSSParser({
  customFields: {
    feed: ["id", ["yt:channelId", "channelId"], "published"],
    item: [
      ["yt:videoId", "videoId"],
      ["yt:channelId", "channelId"],
      "author",
      "published",
      "updated",
      ["media:group", "media"],
    ],
  },
}); */

var feeds = [];

var div_items = document.getElementById("items");

function parseRSS(url) {
  fetch(url, { mode: "no-cors" })
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch(console.error);

  /* parser.parseURL(url, function (error, feed) {
    if (error) throw error;
    //feeds = [...feeds, ...feed.items];
    feed.items.forEach((item) => {
      feeds.push({
        img_url: item.media["media:thumbnail"][0]["$"].url,
        img_width: item.media["media:thumbnail"][0]["$"].width,
        img_height: item.media["media:thumbnail"][0]["$"].height,
        author: item.author,
        link: item.link,
        published: new Date(item.published),
        title: item.title,
        description: item.media["media:description"][0].split('\n',3).join('\n'),
        starRating_count: parseInt(
          item.media["media:community"][0]["media:starRating"][0]["$"].count
        ),
        starRating_average: parseFloat(
          item.media["media:community"][0]["media:starRating"][0]["$"].average
        ),
        views: parseInt(
          item.media["media:community"][0]["media:statistics"][0]["$"].views
        ),
      });
    });
  }); */
}

function showItems() {
  feeds.sort((a, b) => b.published - a.published);
  //feeds.sort((a, b) => -a.published.localeCompare(b.published));

  feeds.forEach((item) => {
    let div_item = redom.el(
      "div.item",
      redom.el("a.link", { href: item.link }, [
        redom.el(
          "div.thumbnail",
          redom.el("img", {
            src: item.img_url,
            width: item.img_width,
            height: item.img_height,
          })
        ),
        redom.el("div.meta", [redom.el("h3.title", item.title)]),
        redom.el("div.metadata", [
          redom.el("span.views", format(item.views) + " views - "),
          redom.el("span.date", moment(item.published).fromNow()),
        ]),
      ])
    );
    div_items.appendChild(div_item);
  });
}

fetch("/yt-rss.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((data_element) => {
      let url =
        "https://www.youtube.com/feeds/videos.xml?channel_id=" +
        data_element.channelId;
      parseRSS(url);
    });
    showItems();
  });
