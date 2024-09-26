import { createCanvas, loadImage } from "canvas";
import axios from "axios";

const descrambleImage = async (imageUrl) => {
   // Fetch the image as a buffer
   const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
   const imageBuffer = Buffer.from(response.data);

   // Create a canvas to manipulate the image
   const img = await loadImage(imageBuffer);
   const width = img.width;
   const height = img.height;

   const canvas = createCanvas(width, height);
   const ctx = canvas.getContext("2d");

   const pieces = [];
   const PIECE_SIZE = 200;
   for (let y = 0; y < height; y += PIECE_SIZE) {
      for (let x = 0; x < width; x += PIECE_SIZE) {
         const w = Math.min(PIECE_SIZE, width - x);
         const h = Math.min(PIECE_SIZE, height - y);
         pieces.push({ x, y, w, h });
      }
   }

   // Shuffle pieces based on your logic
   // Here you would implement your permutation logic as in ImageInterceptor

   // Draw pieces onto the canvas in the correct order
   pieces.forEach((piece) => {
      ctx.drawImage(img, piece.x, piece.y, piece.w, piece.h, piece.x, piece.y, piece.w, piece.h); // Adjust this for your permutation
   });

   return canvas.toDataURL(); // Return base64 image data
};

export default descrambleImage;
