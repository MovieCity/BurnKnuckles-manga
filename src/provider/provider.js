import { mainPageExtractor, homePageExtractor } from "../utils/extractor.js";
import { axiosInterceptor, fetchAPI } from "../utils/axiosInterceptor.js";
import * as cheerio from "cheerio";

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
         languages: {
            chaptersLanguages: [],
            volumesLanguages: [],
         },
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
               const date = itemValue !== "?" ? itemValue.split(" to ") : null;
               const startDate = date ? new Date(date[0].trim()) : null;
               let endDate = null;
               if (date && date[1].trim() !== "?") {
                  endDate = new Date(date[1].trim()) || null;
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

      const chaptersList = $(".tab-content #list-chapter");
      const volumesList = $(".tab-content #list-vol");

      const chaptersLanguages = chaptersList
         ? $(chaptersList).find(".chapter-s-lang .dropdown-menu").find("a")
         : null;
      const volumesLanguages = chaptersList
         ? $(volumesList).find(".chapter-s-lang .dropdown-menu").find("a")
         : null;

      chaptersLanguages &&
         chaptersLanguages
            .map((i, el) => {
               const languageElement = $(el).attr("data-code").toUpperCase();

               obj.languages.chaptersLanguages.push(languageElement);
            })
            .get();
      volumesLanguages &&
         volumesLanguages
            .map((i, el) => {
               const languageElement = $(el).attr("data-code").toUpperCase();

               obj.languages.volumesLanguages.push(languageElement);
            })
            .get();

      const lastChapterMatch = chaptersLanguages
         ? $(".tab-content")
              .find(".chapters-list-ul #en-chapters .item .name")
              .first()
              .text()
              .match(/\d+/)
         : null;
      const lastChapter = lastChapterMatch ? lastChapterMatch[0] : null; // Use [0] instead of [1] if there's only one group
      console.log(lastChapter);

      const lastVolumeMatch = volumesLanguages
         ? $(".tab-content")
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

export const getList = async (req, res) => {
   try {
      const id = req.params.id;
      const type = req.query.type || "chap";
      const lang = req.query.lang || "en";
      if (!id) return res.status(400).json({ status: "error", msg: "id is require" });

      const mangaID = id.split("-").at(-1);

      const Referer = `/${id}`;
      const endpoint = `/ajax/manga/reading-list/${mangaID}?readingBy=${type}`;
      const html = await fetchAPI(Referer, endpoint);

      const $ = cheerio.load(html);
      const $poster = type === "vol" ? await axiosInterceptor(`/${id}`) : null;

      const getVolumesImages = (lang, index) => {
         return $poster(`.volume-list-ul #${lang.toLowerCase()}-volumes .item .manga-poster-img`)
            .eq(index)
            .attr("src");
      };

      const selected = type === "chap" ? "chapters" : "volumes";

      const elements = $(`.chapters-list-ul #${lang.toLowerCase()}-${selected}`);

      if (elements.length < 1)
         return res
            .status(400)
            .json({ status: false, message: `maybe ${selected} not available in ${lang}` });

      const data = $(elements)
         .find("li")
         .map((i, el) => {
            const obj = {
               // readingId: null,
               dataNumber: null,
               title: null,
            };

            // obj.readingId = Number($(el).attr("data-id"));
            obj.dataNumber = Number($(el).attr("data-number"));
            obj.title = $(el).find(".name").text().split(":").at(-1).trim();
            obj.endPoint = `/read/${id}?type=${type}&lang=${lang}&dataNumber=${obj.dataNumber}`;
            if (selected === "volumes") obj.poster = getVolumesImages(lang, i);

            return obj;
         })
         .get();

      data.sort((a, b) => a.dataNumber - b.dataNumber);
      res.status(200).json({ status: true, language: lang, dataBy: selected, data });
   } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getChaptersImages = async (req, res) => {
   try {
      // https://mangareader.to/read/one-piece-3/readingId
      const { id } = req.params;
      const type = req.query.type || "chap";
      const lang = req.query.lang || "en";
      const dataNumber = req.query.dataNumber || 1;

      console.log(type, dataNumber, id);

      if (!id) return res.status(400).json({ status: "error", msg: " id is require" });

      const Referer = `/read/${id}/${lang}/${type === "chap" ? "chapter" : "volume"}-${dataNumber}`;
      const $$ = await axiosInterceptor(Referer);

      const dataReadingId = $$("#wrapper").attr("data-reading-id");
      const dataReadingBy = $$("#wrapper").attr("data-reading-by");
      const dataLang = $$("#wrapper").attr("data-lang-code");

      const endpoint = `/ajax/image/list/${dataReadingBy}/${dataReadingId}?mode=vertical&quality=high&hozPageSize=1`;
      //               /ajax/image/list/chap/8954?mode=vertical&quality=medium&hozPageSize=1

      console.log(Referer);
      // https://mangareader.to/read/one-piece-3  --> essential for making request like browser

      const html = await fetchAPI(Referer, endpoint);

      const $ = cheerio.load(html);

      const urls = $(".iv-card")
         .map((index, item) => {
            const obj = {
               url: null,
               pageNumber: null,
            };
            const url = $(item).attr("data-url");
            obj.pageNumber = index + 1;
            obj.url = $(item).hasClass("shuffled") ? url + "&shuffled" : url;
            return obj;
         })
         .get();

      const response = {
         status: true,
         totalPages: urls.length,
         readingBy: dataReadingBy,
         language: dataLang,
         dataNumber,
         data: urls,
      };
      res.status(200).json(response);
   } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
   }
};

export const getCharactersList = async (req, res) => {
   try {
      const page = req.query.page || 1;
      const { id } = req.params;
      const Referer = `/${id}`;
      const endPoint = `/ajax/character/list/${id.split("-").at(-1)}?page=${page}`;
      const html = await fetchAPI(Referer, endPoint);
      const $ = cheerio.load(html);

      const character = $(".cl-item")
         .map((i, el) => {
            const obj = {
               id: null,
               image: null,
               name: null,
               type: null,
            };
            obj.image = $(el).find(".character-thumb-img").attr("src");
            obj.id = $(el).find(".cli-info a").attr("href").split("/").at(-1);
            obj.name = $(el).find(".cli-info a").text().trim();
            obj.type = $(el).find(".sub").text().trim();
            return obj;
         })
         .get();
      if (character.length < 1)
         return res.status(404).json({ status: false, message: "Characters not found" });
      let totalPages = $(".page-item a").last().attr("data-url");
      totalPages = totalPages ? Number(totalPages.split("page=").at(-1)) : Number(page);
      const hasNextPage = page < totalPages;

      const response = {
         status: true,
         totalPages,
         currentPage: Number(page),
         hasNextPage,
         character,
      };
      res.status(200).json(response);
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};

export const getRecommendation = async (req, res) => {
   try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ status: false, message: "id is require" });

      const $ = await axiosInterceptor(`/${id}`);

      const recommendation = $(
         ".block_area.block_area_sidebar.block_area-realtime .block_area-content .ulclear .item-top"
      )
         .map((i, el) => {
            const obj = {
               title: null,
               id: null,
               genres: [],
               poster: null,
            };
            obj.poster = $(el).find(".manga-poster img").attr("src");
            obj.id = $(el).find(".manga-name a").attr("href").split("/").at(-1);
            obj.title = $(el).find(".manga-name a").attr("title");
            $(el)
               .find(".fdi-item.fdi-cate a")
               .each((i, item) => {
                  obj.genres.push($(item).text().trim());
               });
            return obj;
         })
         .get();
      res.status(200).json({ status: true, data: recommendation });
   } catch (error) {
      res.status(500).json({ status: false, message: error.message });
   }
};
