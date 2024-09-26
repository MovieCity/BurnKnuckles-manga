import axios from "axios";
import * as cheerio from "cheerio";

const axiosInterceptor = async (endpoint) => {
   const baseUrl = "https://mangareader.to";
   console.log(baseUrl + endpoint);
   try {
      const { data } = await axios.get(baseUrl + endpoint);
      const $ = cheerio.load(data);
      return $;
   } catch (error) {
      return error.message;
   }
};
const getChaptersUrls = async (Referer, endpoint) => {
   try {
      const baseUrl = "https://mangareader.to";
      console.log(`${baseUrl}/ajax/image/list/${endpoint}`);
      console.log(Referer);

      const {
         data: { html },
      } = await axios.get(`${baseUrl}/ajax/image/list/${endpoint}`, {
         headers: {
            "User-Agent":
               "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
            Referer,
            "X-Requested-With": "XMLHttpRequest",
         },
      });
      const $ = cheerio.load(html);
      return $;
   } catch (error) {
      return error.message;
   }
};
export { axiosInterceptor, getChaptersUrls };
