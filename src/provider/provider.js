import * as cheerio from "cheerio";

import { mainPageExtractor, homePageExtractor } from "../utils/extractor.js";
import { axiosInterceptor, getChaptersUrls } from "../utils/axiosInterceptor.js";

export const getTrending = (req, res) => homePageExtractor("#trending-home", res);
export const getRecommended = (req, res) => homePageExtractor("#featured-03", res);
export const getCompleted = (req, res) => homePageExtractor("#featured-04", res);

export const getGenres_types_sort = async (req, res) => {
   try {
      const $ = await axiosInterceptor("/home");

      const genresElements = $(".cbl-row").last().find(".item");
      const typeElements = $(".types-sub .ts-item");

      const sort = ["default", "latest-updated", "score", "name-az", "release-date", "most-viewed"];

      const genresData = [];
      genresElements.each((index, item) => {
         const genre = $(item).text().trim();
         genresData.push(genre);
      });
      const typesData = [];
      typeElements.each((index, item) => {
         const type = $(item).text().trim();
         typesData.push(type);
      });

      const filteredGenres = genresData.slice(0, -1);

      const data = {
         genres: filteredGenres,
         types: typesData,
         sort,
      };

      res.status(200).json({
         status: "success",
         data,
      });
   } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getLatestUpdates = async (req, res) => {
   try {
      const $ = await axiosInterceptor("/home");

      const mangaItemsCh = $(".tab-content #latest-chap .mls-wrap .item");
      const mangaItemsVol = $(".tab-content #latest-vol .mls-wrap .item");

      const getLatest = (data, keyName) => {
         const mangaData = [];

         data.each((index, item) => {
            const obj = {
               title: null,
               id: null,
               poster: null,
               languages: [],
               genres: [],
            };
            // Extract the title
            const titleElement = $(item).find(".manga-name a");
            obj.title = titleElement ? titleElement.text() : null;

            // Extract the image URL
            obj.poster = $(item).find(".manga-poster img").attr("src");

            // Extract the languages (in your case it's in the "tick tick-lang" span)
            const languages = $(item).find(".tick-lang").text() || null;

            const languagesArray = languages.includes("/")
               ? languages.split("/")
               : languages.split(" ");
            obj.languages.push(languagesArray);

            // Extract the most recent chapter number
            const chapterOrVolume = $(item).find(".fd-list .fdl-item .chapter a");

            const matchType = keyName === "chapters" ? /Chap\s(\d+)/ : /Vol\s(\d+)/;

            const chapterOrVolumeText = chapterOrVolume
               ? chapterOrVolume.text().match(matchType)
               : null;
            const number = chapterOrVolumeText ? parseInt(chapterOrVolumeText[1]) : null;

            const type = `total${keyName}`;
            obj[type] = number;

            obj.id = titleElement ? titleElement.attr("href").split("/").at(-1) : null;

            // Extract genres (as an array)
            const genreElements = $(item).find(".fdi-cate a");
            genreElements.each((index, item) => {
               const genre = $(item).text();
               obj.genres.push(genre);
            });

            mangaData.push(obj);
         });
         return mangaData;
      };

      const chapters = getLatest(mangaItemsCh, "chapters");
      const volumes = getLatest(mangaItemsVol, "volumes");

      const data = {
         chapters,
         volumes,
      };

      res.status(200).json({
         status: "success",
         content_Length: data.length,
         latestUpdate: data,
      });
   } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
   }
};
export const mostViewed = async (req, res) => {
   try {
      const $ = await axiosInterceptor("/home");

      const getData = (data) => {
         const mangaData = [];
         $(data).each((index, item) => {
            const obj = {
               title: null,
               id: null,
               rank: null,
               views: null,
               languages: [],
               totalChapters: null,
               totalVolumes: null,
               poster: null,
               genres: [],
            };
            obj.rank = index + 1;
            const views = $(item)
               .find(".fdi-view")
               .text()
               .replace(/[^0-9]/g, "");

            obj.views = Number(views);

            const titleElement = $(item).find(".manga-name a");
            obj.title = titleElement.text();

            // Extract the image URL
            obj.poster = $(item).find(".manga-poster img").attr("src");

            const languages = $(item).find(".fd-infor .fdi-item").first().text().trim();

            const languagesArray = languages.includes("/")
               ? languages.split("/")
               : languages.split(" ");
            obj.languages = languagesArray;
            const list = $(item).find(".fd-infor .d-block a");

            const chapters = list.first()
               ? list
                    .first()
                    .text()
                    .match(/Chap\s(\d+)/)
               : null;
            const volumes = list.last()
               ? list
                    .last()
                    .text()
                    .match(/Vol\s(\d+)/)
               : null;

            obj.totalChapters = chapters ? Number(chapters[1]) : null;
            obj.totalVolumes = volumes ? Number(volumes[1]) : null;

            obj.id = titleElement.attr("href").split("/").at(-1);

            // Extract genres (as an array)
            const genresElements = $(item).find(".fdi-cate a");
            genresElements.each((index, item) => {
               const genre = $(item).text();
               obj.genres.push(genre);
            });

            mangaData.push(obj);
         });
         return mangaData;
      };

      const todaysMostViewedElements = $(".cbox-content .tab-content #chart-today li");
      const weeksMostViewedElements = $(".cbox-content .tab-content #chart-week li");
      const monthsMostViewedElements = $(".cbox-content .tab-content #chart-month li");

      const todaysMostViewed = getData(todaysMostViewedElements);
      const weeksMostViewed = getData(weeksMostViewedElements);
      const monthsMostViewed = getData(monthsMostViewedElements);

      const mostViewed = {
         todaysMostViewed,
         weeksMostViewed,
         monthsMostViewed,
      };

      res.status(200).json({ status: "success", mostViewed });
   } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getMangaByQueryAndCategory = async (req, res) => {
   const query = req.params.query;
   const category = req.params.category || null;
   // category =  genres : type : most viewed ect...
   const page = req.query.page ? req.query.page : 1;
   const sort = req.query.sort ? req.query.sort : "default";

   const endpoint = category
      ? `/${query}/${category}?sort=${sort}&page=${page}`
      : `/${query}?sort=${sort}&page=${page}`;
   mainPageExtractor(endpoint, res);
};
export const getMangaBySearch = async (req, res) => {
   let keyword = req.query.keyword;

   keyword = keyword.replace(" ", "+");
   const page = req.query.page || 1;

   const endpoint = `/search?keyword=${keyword}&page=${page}`;
   mainPageExtractor(endpoint, res);
};

export const getInfo = async (req, res) => {
   try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ status: "error", msg: "id is require" });

      const $ = await axiosInterceptor(`/${id}`);

      const obj = {
         id: null,
         title: null,
         alternativeTitle: null,
         poster: null,
         languages: [],
         genres: [],
         synopsis: null,
         type: null,
         endDate: null,
         status: null,
         authors: null,
         magazines: null,
         published: null,
         rating: null,
         views: null,
         totalChapters: null,
         totalVolumes: null,
      };

      const $mainContent = $(".anis-content");

      obj.title = $($mainContent).find(".manga-name").text();
      obj.alternativeTitle = $($mainContent).find(".manga-name-or").text();
      const _id = $($mainContent).find(".manga-buttons a").first().attr("href");
      if (_id) {
         obj.id = _id.split("/").at(-1);
      }
      obj.poster = $($mainContent).find(".manga-poster img").attr("src");
      const genres = $($mainContent).find(".sort-desc .genres a");
      genres.each((index, item) => obj.genres.push($(item).text()));
      obj.synopsis = $($mainContent).find(".description").text();

      const currentDetails = $($mainContent).find(".anisc-info .item");

      currentDetails.each((index, item) => {
         const itemHead = $(item).find(".item-head").text().trim();
         const itemValue = $(item).find(".name, a").text().trim();

         switch (itemHead) {
            case "Type:":
               obj.type = itemValue || null;
               break;
            case "Status:":
               obj.status = itemValue || null;
               break;
            case "Authors:":
               obj.authors = itemValue || null;
               break;
            case "Magazines:":
               obj.magazines = itemValue || null;
               break;
            case "Published:":
               const dateParts = itemValue.split(" to ");
               const startDate = new Date(dateParts[0].trim());
               let endDate = null;
               if (dateParts[1].trim() !== "?") {
                  endDate = new Date(dateParts[1].trim());
               }
               obj.published = startDate || null;
               obj.endDate = endDate;
               break;
            case "Score:":
               obj.rating = Number(itemValue) || null;
               break;
            case "Views:":
               const views = itemValue.replace(/,/g, "") || null;
               obj.views = Number(views) || null;
               break;
            default:
               break;
         }
      });
      const $readingHtml = $(".tab-content");

      const languages = $($readingHtml).find(".chapter-s-lang .dropdown-menu").first().find("a");

      languages.each((index, item) => {
         const languageElement = $(item).attr("data-code").toUpperCase();

         obj.languages.push(languageElement);
      });

      const hasChapters = $($readingHtml).has("#list-chapter") || null;
      const hasVolumes = $($readingHtml).has("#list-vol") || null;

      const lastChapterMatch = hasChapters
         ? $($readingHtml)
              .find(".chapters-list-ul #en-chapters .item .name")
              .first()
              .text()
              .match(/\d+/)
         : null;
      const lastChapter = lastChapterMatch ? lastChapterMatch[0] : null; // Use [0] instead of [1] if there's only one group
      console.log(lastChapter);

      const lastVolumeMatch = hasVolumes
         ? $($readingHtml)
              .find(".volume-list-ul #en-volumes .item .tick-vol")
              .first()
              .text()
              .match(/\d+/)
         : null;
      const lastVolume = lastVolumeMatch ? lastVolumeMatch[0] : null; // Use [0] instead of [1] if there's only one group

      obj.totalChapters = lastChapter ? Number(lastChapter) : null;
      obj.totalVolumes = lastVolume ? Number(lastVolume) : null;

      res.status(200).json({ status: "success", data: obj });
   } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getChapters = async (req, res) => {
   try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ status: "error", msg: "id is require" });
      const $ = await axiosInterceptor(`/${id}`);

      const chaptersLanguages = $(".chapter-s-lang .dropdown-menu")
         .first()
         .find("a")
         .map((index, item) => {
            const obj = {
               language: null,
               chapters: null,
            };

            const languageText = $(item).text().trim();
            const chaptersMatch = languageText.match(/\((\d+)\s+chapters\)/);

            obj.language = $(item).attr("data-code");
            obj.chapters = chaptersMatch ? Number(chaptersMatch[1]) : null;
            return [obj];
         })
         .get();

      const chapters = $(`.chapters-list-ul #en-chapters .item`)
         .map((index, el) => {
            const obj = {
               chapterNumber: null,
               title: null,
            };

            const number = $(el).attr("data-number");
            obj.chapterNumber = Number(number) || null;
            const title = $(el).find("a").attr("title").split(":")[1].trim();

            obj.title = title || null;
            return obj;
         })
         .get();

      const chaptersSort = chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      return res.status(200).json({
         status: "success",
         data: { languages: chaptersLanguages, chapters: chaptersSort },
      });
   } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getChaptersImages = async (req, res) => {
   try {
      const { id, lang, chapterNumber } = req.params;

      if (!id || !lang || !chapterNumber)
         return res.status(400).json({ status: "error", msg: "params is require" });

      const Referer = `/read/${id}/${lang}/chapter-${chapterNumber}`;

      const $getInfo = await axiosInterceptor(Referer);

      const readingId = $getInfo("#wrapper").attr("data-reading-id");
      const readingBy = $getInfo("#wrapper").attr("data-reading-by");
      const dataLang = $getInfo("#wrapper").attr("data-lang-code");
      const mangaId = $getInfo("#wrapper").attr("data-manga-id");

      const endpoint = `${readingBy}/${readingId}?mode=vertical&quality=high&hozPageSize=1`;

      // https://mangareader.to/ajax/image/list/chap/8954?mode=vertical&quality=medium&hozPageSize=1

      const $ = await getChaptersUrls(Referer, endpoint);

      const urls = $(".iv-card")
         .map((index, item) => {
            return $(item).attr("data-url");
         })
         .get();

      res.status(200).json({ status: "success", data: urls });
   } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
   }
};
