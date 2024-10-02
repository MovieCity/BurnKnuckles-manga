import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const baseUrl = "https://mangareader.to";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filepath = path.join(__dirname, "../../outputs");

const axiosInterceptor = async (endpoint) => {
   console.log(baseUrl + endpoint);
   try {
      const { data } = await axios.get(baseUrl + endpoint);
      const $ = cheerio.load(data);
      return $;
   } catch (error) {
      return error.message;
   }
};
// 2 main urls
// https://mangareader.to/ajax/manga/reading-list/56380?readingBy=vol
// https://mangareader.to/ajax/images/list/chap/65103?mode=vertical&quality=high&hozPageSize=1

const fetchAPI = async (Referer, endpoint) => {
   try {
      console.log(baseUrl + endpoint);

      const { data } = await axios.get(baseUrl + endpoint, {
         headers: {
            "User-Agent":
               "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
            Referer: baseUrl + Referer,
            "X-Requested-With": "XMLHttpRequest",
         },
      });

      console.log(data.html);

      return data.html;
   } catch (error) {
      return error.message;
   }
};
export { axiosInterceptor, fetchAPI };
