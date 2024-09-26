import { axiosInterceptor } from "./axiosInterceptor.js";

const baseUrl = "https://mangareader.to";

export const homePageExtractor = async (selector, res) => {
   try {
      const endpoint = selector === "#trending-home" ? ".item" : ".mg-item-basic";
      // const response = await axios.get(baseUrl + "/home", res);
      const $ = await axiosInterceptor("/home");

      const $elements = $(`${selector} .swiper-slide ${endpoint}`);

      const mangaData = [];
      $elements.each((index, element) => {
         const obj = {
            title: "",
            id: "",
            imgUrl: "",
            languages: [],
            genres: [],
            totalChapters: null,
            rating: null,
         };
         obj.title = $(element).find(".alias-name strong").text();

         const $detailElement = $(element).find(".mp-desc");

         const rating = $detailElement.find("p").eq(1).text().trim() || null;

         obj.rating = rating === "N/A" ? null : Number(rating);

         let languages = $detailElement.find("p").eq(2).text();

         obj.languages = languages.includes("/") ? languages.split("/") : languages.split(" ");

         const chapters = $detailElement.find("p a:contains('Chap')").text().trim();

         obj.totalChapters = chapters ? Number(chapters.match(/Chap\s(\d+)/)[1]) : null;

         obj.imgUrl = $(element).find(".manga-poster-img").attr("src");
         obj.id = $(element).find(".mpd-buttons a.btn-light").attr("href").split("/").at(-1);

         const genresElements = $(element).find(".manga-detail .fd-infor a");

         genresElements ? genresElements.each((_, item) => obj.genres.push($(item).text())) : null;

         mangaData.push(obj);
      });

      res.status(200).json({ status: "success", data: mangaData });
   } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
   }
};

export const mainPageExtractor = async (endpoint, res) => {
   try {
      const currentPage = Number(endpoint.split("page=").at(-1));
      const $ = await axiosInterceptor(endpoint, res);

      const $$ = $(".mls-wrap .item");

      if ($$ <= 0) return res.status(400).json({ status: "error", msg: "page not found" });

      const pageElements = $(".page-item .page-link").last();

      const mangaData = [];

      const lastPage = pageElements
         ? $(pageElements).attr("href")
            ? $(pageElements).attr("href").split("page=").at(-1)
            : $(pageElements).text()
         : null;

      const hasNextPage = pageElements.attr("href") ? true : false;

      const lastPageNumber = lastPage ? parseInt(lastPage) : currentPage;

      $$.each((index, item) => {
         const obj = {
            id: null,
            title: null,
            imgUrl: null,
            languages: [],
            genres: [],
            totalChapters: null,
         };
         const titleElement = $(item).find(".manga-detail .manga-name a");

         obj.title = titleElement ? $(titleElement).text() : null;
         obj.id = titleElement.attr("href").split("/").at(-1);

         const genreElements = $(item).find(".fd-infor  .fdi-item a");

         genreElements.each((index, item) => {
            obj.genres.push($(item).text());
         });

         const chapterElement = $(item).find(".fd-list .fdl-item .chapter").first();

         const regex = chapterElement
            .text()
            .trim()
            .match(/Chap\s(\d+)/)
            ? chapterElement
                 .text()
                 .trim()
                 .match(/Chap\s(\d+)/)[1]
            : null;
         obj.totalChapters = regex ? Number(regex) : null;

         const languages = $(item).find(".tick-lang").text().trim();
         obj.languages = languages.includes("/") ? languages.split("/") : languages.split(" ");

         obj.imgUrl = $(item).find(".manga-poster-img").attr("src");
         mangaData.push(obj);
      });
      res.status(200).json({
         status: "success",
         currentPage,
         hasNextPage,
         totalPage: lastPageNumber,
         content_Length: mangaData.length,
         data: mangaData,
      });
   } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
   }
};
